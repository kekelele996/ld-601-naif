import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { StatusBadge } from "../components/common/StatusBadge";
import { FacilityTag } from "../components/common/FacilityTag";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { EmptyState } from "../components/common/EmptyState";
import { FilterBar } from "../components/common/FilterBar";
import { useFacilityClosureFlow } from "../hooks/useFacilityClosureFlow";
import { FacilityStatusText } from "../constants/FacilityStatus";
import { FacilityClosureStatusText } from "../constants/FacilityClosureStatus";
import { AssistanceStatusText } from "../constants/AssistanceStatus";
import { BarrierVerifyStatusText } from "../constants/BarrierVerifyStatus";
import { RouteRiskLevelText } from "../constants/RouteRiskLevel";
import { formatDate, formatDispatchAllowed } from "../utils/formatters";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { FacilityClosure, CreateFacilityClosureForm } from "../types/FacilityClosure";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// 把后端 datetime 转成本地 datetime-local 控件需要的格式
const toLocalInputValue = (iso: string) => dayjs(iso).format("YYYY-MM-DDTHH:mm");

export function FacilitiesPage() {
  const flow = useFacilityClosureFlow();
  const [floorFilter, setFloorFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [closingFacility, setClosingFacility] = useState<AccessibleFacility | null>(null);
  const [releasingClosure, setReleasingClosure] = useState<FacilityClosure | null>(null);
  const [form] = Form.useForm<CreateFacilityClosureForm>();

  const floors = useMemo(() => ["ALL", ...Array.from(new Set(flow.facilities.map((row) => row.floor)))], [flow.facilities]);

  const visibleFacilities = useMemo(
    () =>
      flow.facilities.filter(
        (facility) =>
          (floorFilter === "ALL" || facility.floor === floorFilter) &&
          (statusFilter === "ALL" || facility.status === statusFilter)
      ),
    [flow.facilities, floorFilter, statusFilter]
  );

  const pendingReportsByFacility = useMemo(() => {
    const map = new Map<number, number>();
    flow.reports.filter((report) => report.verify_status === "PENDING").forEach((report) => {
      map.set(report.facility_id, (map.get(report.facility_id) ?? 0) + 1);
    });
    return map;
  }, [flow.reports]);

  const openCloseModal = (facility: AccessibleFacility) => {
    setClosingFacility(facility);
    form.setFieldsValue({
      facility_id: facility.id,
      impact_scope: `影响途经「${facility.name}」的全部无障碍路线`,
      estimated_released_at: toLocalInputValue(dayjs().add(4, "hour").toISOString())
    });
  };

  const submitClose = async () => {
    const values = await form.validateFields();
    const payload: CreateFacilityClosureForm = {
      facility_id: closingFacility?.id ?? values.facility_id,
      impact_scope: values.impact_scope,
      estimated_released_at: new Date(values.estimated_released_at).toISOString()
    };
    const created = await flow.closeFacility(payload);
    if (created) {
      setClosingFacility(null);
      form.resetFields();
    }
  };

  const submitRelease = async () => {
    if (!releasingClosure) return;
    const result = await flow.releaseClosure(releasingClosure.id);
    if (result) setReleasingClosure(null);
  };

  const facilityColumns: ColumnsType<AccessibleFacility> = [
    { title: "设施", key: "name", render: (_, record) => <FacilityTag title={record.name} value={record.facility_type} /> },
    { title: "位置编码", dataIndex: "location_code", key: "location_code" },
    { title: "楼层", dataIndex: "floor", key: "floor" },
    {
      title: "状态",
      key: "status",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <StatusBadge value={record.status} />
          <Text type="secondary" style={{ fontSize: 12 }}>{FacilityStatusText[record.status as keyof typeof FacilityStatusText] ?? record.status}</Text>
        </Space>
      )
    },
    {
      title: "待核实障碍",
      key: "pending",
      render: (_, record) =>
        pendingReportsByFacility.get(record.id) ? <Tag color="orange">{pendingReportsByFacility.get(record.id)} 条待核实</Tag> : <Tag>无</Tag>
    },
    { title: "最近巡检", dataIndex: "last_checked_at", key: "last_checked_at", render: (value: string) => formatDate(value) },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => {
        const active = flow.activeClosureByFacility.get(record.id);
        if (active) {
          return (
            <Space>
              <Tag color="red">封控中 #{active.id}</Tag>
              <Button size="small" danger onClick={() => setReleasingClosure(active)}>
                解除封控
              </Button>
            </Space>
          );
        }
        return (
          <Button size="small" type="primary" ghost onClick={() => openCloseModal(record)}>
            因障碍封控
          </Button>
        );
      }
    }
  ];

  const routeColumns = [
    { title: "路线", key: "name", render: (_: unknown, row: { id: number; origin_text: string; destination_text: string }) => `${row.origin_text} → ${row.destination_text}（#${row.id}）` },
    { title: "启用", dataIndex: "active", key: "active", render: (value: boolean) => <StatusBadge value={value ? "ACTIVE" : "SUSPENDED"} /> },
    { title: "允许派单", dataIndex: "dispatch_allowed", key: "dispatch_allowed", render: (value: boolean) => (value ? <Tag color="green">允许</Tag> : <Tag color="red">{formatDispatchAllowed(false)}</Tag>) },
    { title: "风险", dataIndex: "risk_level", key: "risk_level", render: (value: string) => <RouteRiskPanel title="路线风险" value={value} /> },
    {
      title: "风险文案",
      key: "riskText",
      render: (_: unknown, row: { risk_level: string }) => RouteRiskLevelText[row.risk_level as keyof typeof RouteRiskLevelText] ?? row.risk_level
    }
  ];

  const requestColumns = [
    { title: "请求", dataIndex: "id", key: "id", render: (id: number) => `协助请求 #${id}` },
    { title: "路线", dataIndex: "route_plan_id", key: "route_plan_id", render: (id: number) => `路线 #${id}` },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value: string, row: { redispatch_required: boolean }) => (
        <Space>
          <StatusBadge value={value} />
          {row.redispatch_required && <Tag color="orange">待重派</Tag>}
        </Space>
      )
    },
    { title: "志愿者", key: "helper", render: (_: unknown, row: { helper_id: number }) => (row.helper_id ? `#${row.helper_id}` : "—") },
    { title: "状态文案", dataIndex: "status", key: "statusText", render: (value: string) => AssistanceStatusText[value as keyof typeof AssistanceStatusText] ?? value },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, row: { id: number; status: string; redispatch_required: boolean; route_plan_id: number }) => {
        const route = flow.routes.find((item) => item.id === row.route_plan_id);
        const canDispatch = row.status === "REQUESTED" && row.redispatch_required && route?.active && route.dispatch_allowed;
        return (
          <Button size="small" disabled={!canDispatch} onClick={() => void flow.redispatch(row.id, 20 + row.id)}>
            重新派单
          </Button>
        );
      }
    }
  ];

  return (
    <section className="closure-page">
      <Space style={{ justifyContent: "space-between", width: "100%" }} align="center">
        <div>
          <p className="eyebrow">accessroute / facilities</p>
          <h1>设施巡检 · 封控闭环</h1>
        </div>
        <Button onClick={() => void flow.refresh()} loading={flow.loading}>刷新回读状态</Button>
      </Space>

      <Alert
        type="info"
        showIcon
        message="闭环规则"
        description="封控：设施进入封控态，受影响路线立即停用，已发出协助请求退回待重派。解除：设施恢复；若仍有待核实障碍，路线保持高风险并禁止派单。同一设施仅一条有效封控，重复提交 / 并发解除 / 刷新重放均只生效一次；任一步校验失败时设施、路线和协助请求保持原样。"
      />

      <FilterBar>
        <Space wrap>
          <span>楼层</span>
          <Select value={floorFilter} onChange={setFloorFilter} style={{ width: 120 }} options={floors.map((floor) => ({ value: floor, label: floor === "ALL" ? "全部楼层" : floor }))} />
          <span>设施状态</span>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: "ALL", label: "全部状态" },
              ...Object.entries(FacilityStatusText).map(([value, label]) => ({ value, label }))
            ]}
          />
        </Space>
      </FilterBar>

      <Table rowKey="id" loading={flow.loading} columns={facilityColumns} dataSource={visibleFacilities} pagination={false} />

      <div className="closure-grid">
        <div className="panel">
          <h2>路线状态回读</h2>
          <Table rowKey="id" size="small" columns={routeColumns} dataSource={flow.routes} pagination={false} />
        </div>
        <div className="panel">
          <h2>协助请求回读</h2>
          {flow.requests.length === 0 ? <EmptyState title="暂无协助请求" /> : <Table rowKey="id" size="small" columns={requestColumns} dataSource={flow.requests} pagination={false} />}
        </div>
      </div>

      <div className="panel">
        <h2>封控记录时间线</h2>
        {flow.closures.length === 0 ? (
          <EmptyState title="暂无封控记录" />
        ) : (
          <Timeline
            items={flow.closures
              .slice()
              .sort((a, b) => b.id - a.id)
              .map((closure) => {
                const facility = flow.facilities.find((item) => item.id === closure.facility_id);
                return {
                  color: closure.status === "ACTIVE" ? "red" : closure.pending_barrier_on_release ? "orange" : "green",
                  children: (
                    <Space direction="vertical" size={2}>
                      <Space>
                        <strong>封控 #{closure.id} · {facility?.name ?? `设施#${closure.facility_id}`}</strong>
                        <StatusBadge value={closure.status} />
                        <Text type="secondary">{FacilityClosureStatusText[closure.status]}</Text>
                      </Space>
                      <Paragraph style={{ margin: 0 }}>影响范围：{closure.impact_scope}</Paragraph>
                      <Text type="secondary">
                        预计解除：{formatDate(closure.estimated_released_at)} ｜ 受影响路线：{closure.affected_route_ids.join(", ") || "无"} ｜ 退回请求：
                        {closure.returned_request_ids.join(", ") || "无"}
                      </Text>
                      {closure.status === "RELEASED" && (
                        <Text type={closure.pending_barrier_on_release ? "warning" : "success"}>
                          {closure.released_at ? `已于 ${formatDate(closure.released_at)} 解除` : ""}
                          {closure.pending_barrier_on_release ? "；仍有待核实障碍，路线保持高风险并禁止派单" : "；障碍已清，路线恢复原状态"}
                        </Text>
                      )}
                    </Space>
                  )
                };
              })}
          />
        )}
      </div>

      <Modal
        title={closingFacility ? `因障碍封控：${closingFacility.name}` : "因障碍封控"}
        open={Boolean(closingFacility)}
        onOk={() => void submitClose()}
        confirmLoading={flow.acting}
        onCancel={() => setClosingFacility(null)}
        okText="提交封控"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="facility_id" hidden><Input /></Form.Item>
          <Form.Item
            name="impact_scope"
            label="影响范围"
            rules={[{ required: true, whitespace: true, message: "请填写封控影响范围" }]}
          >
            <TextArea rows={3} placeholder="例如：影响 B1 换乘大厅途经 1 号电梯的全部无障碍路线" />
          </Form.Item>
          <Form.Item
            name="estimated_released_at"
            label="预计解除时间"
            rules={[
              { required: true, message: "请选择预计解除时间" },
              {
                validator: (_rule, value: string) =>
                  value && new Date(value).getTime() > Date.now() ? Promise.resolve() : Promise.reject(new Error("预计解除时间必须晚于当前时间"))
              }
            ]}
            extra="必须晚于当前时间"
          >
            <Input type="datetime-local" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={releasingClosure ? `解除封控 #${releasingClosure.id}` : "解除封控"}
        open={Boolean(releasingClosure)}
        onOk={() => void submitRelease()}
        confirmLoading={flow.acting}
        onCancel={() => setReleasingClosure(null)}
        okText="确认解除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        {releasingClosure && (
          <Space direction="vertical">
            <Paragraph>设施将恢复为封控前状态（{releasingClosure.previous_facility_status}）。</Paragraph>
            {pendingReportsByFacility.get(releasingClosure.facility_id) ? (
              <Alert type="warning" showIcon message="该设施仍有待核实障碍" description="设施可恢复，但受影响路线保持高风险并禁止派单，直至障碍核实关闭。" />
            ) : (
              <Alert type="success" showIcon message="无待核实障碍" description="受影响路线将恢复封控前的启用与派单状态。" />
            )}
          </Space>
        )}
      </Modal>
    </section>
  );
}
