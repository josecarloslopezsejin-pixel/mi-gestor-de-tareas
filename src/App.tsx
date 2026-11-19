import { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard,
  ListTodo,
  Plus,
  CheckCircle2,
  Settings,
  Search,
  Menu,
  Clock,
  Trash2,
  CheckCheck,
  AlertTriangle,
  Bell,
  UserRound,
  ChevronDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { clsx } from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "low" | "medium" | "high";
type TaskStatus = "pending" | "completed";
type NavPage =
  | "dashboard"
  | "tasks"
  | "completed"
  | "add-task"
  | "categories"
  | "add-category"
  | "calendar"
  | "settings"
  | "help";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
}

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const TODAY_STR = [
  TODAY.getFullYear(),
  String(TODAY.getMonth() + 1).padStart(2, "0"),
  String(TODAY.getDate()).padStart(2, "0"),
].join("-");

const INIT_TASKS: Task[] = [
  {
    id: "1",
    title: "Comprar alimentos",
    description:
      "Realizar las compras necesarias para el hogar",
    category: "Compras",
    deadline: "2026-11-19",
    priority: "high",
    status: "pending",
    createdAt: "2026-11-10",
  },
  {
    id: "2",
    title: "Organizar documentos",
    description: "Clasificar y organizar documentos personales",
    category: "Personal",
    deadline: "2026-11-20",
    priority: "medium",
    status: "pending",
    createdAt: "2026-11-10",
  },
  {
    id: "3",
    title: "Pagar servicio de internet",
    description: "Realizar el pago mensual del servicio",
    category: "Finanzas",
    deadline: "2026-11-13",
    priority: "high",
    status: "pending",
    createdAt: "2026-11-09",
  },
  {
    id: "4",
    title: "Limpiar la habitación",
    description: "Organizar y limpiar la habitación",
    category: "Hogar",
    deadline: "2026-11-12",
    priority: "low",
    status: "completed",
    createdAt: "2026-11-08",
  },
  {
    id: "5",
    title: "Estudiar para el examen",
    description: "Repasar los temas pendientes para el examen",
    category: "Estudios",
    deadline: "2026-11-20",
    priority: "high",
    status: "pending",
    createdAt: "2026-11-10",
  },
  {
    id: "6",
    title: "Solicitar cita médica",
    description:
      "Contactar al centro médico para programar una cita",
    category: "Salud",
    deadline: "2026-11-14",
    priority: "medium",
    status: "pending",
    createdAt: "2026-11-10",
  },
  {
    id: "7",
    title: "Compartir tiempo en familia",
    description: "Organizar una actividad familiar",
    category: "Familia",
    deadline: "2026-11-13",
    priority: "low",
    status: "completed",
    createdAt: "2026-11-08",
  },
  {
    id: "8",
    title: "Realizar trámite pendiente",
    description:
      "Consultar los requisitos y completar el trámite",
    category: "Trámites",
    deadline: "2026-11-09",
    priority: "high",
    status: "pending",
    createdAt: "2026-11-07",
  },
];

const PREDEFINED_CATEGORIES = [
  "Trabajo",
  "Estudios",
  "Hogar",
  "Finanzas",
  "Salud",
  "Compras",
  "Trámites",
  "Familia",
  "Personal",
  "Recreación",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isOverdue = (t: Task) =>
  t.status === "pending" && t.deadline < TODAY_STR;

const daysUntil = (deadline: string) =>
  Math.ceil(
    (new Date(deadline + "T00:00:00").getTime() -
      TODAY.getTime()) /
    86400000,
  );

const fmtShort = (s: string) =>
  new Date(s + "T00:00:00").toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });

const DISPLAY = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};
const BODY = { fontFamily: "'Inter', sans-serif" };

// ─── Atoms ────────────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const cls = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }[priority];
  const label = {
    high: "Alta",
    medium: "Media",
    low: "Baja",
  }[priority];
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize",
        cls,
      )}
    >
      {label}
    </span>
  );
}


function StatusChip({ status }: { status: TaskStatus }) {
  return status === "completed" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F0EB] text-[#729681] border border-[#D6E5DA]">
      <CheckCircle2 size={11} />
      Completada
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8DDEB] text-[#80658B] border border-[#DCCCE1]">
      <Clock size={11} />
      Pendiente
    </span>
  );
}


// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const overdue = isOverdue(task);
  const days = daysUntil(task.deadline);

  return (
    <tr className="border-b border-[#F0DFDF] hover:bg-[#FAF6F8] transition-colors group">      <td className="py-3.5 px-4">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          aria-label={
            task.status === "completed"
              ? "Marcar como pendiente"
              : "Marcar como completada"
          }
          className={clsx(
            "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            task.status === "completed"
              ? "bg-[#729681] border-[#729681] text-white"
              : "border-[#C8B9CE] hover:border-[#80658B]",
          )}
        >
          {task.status === "completed" && (
            <CheckCheck size={11} />
          )}
        </button>
        <div className="min-w-0">
          <p
            className={clsx(
              "text-sm font-semibold text-slate-800 leading-snug",
              task.status === "completed" &&
              "line-through text-slate-400",
            )}
          >
            {task.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {task.description}
          </p>
          <span className="inline-block mt-1 text-xs text-[#80658B] bg-[#E8DDEB] px-2 py-0.5 rounded-full">
            {task.category}
          </span>
        </div>
      </div>
    </td>
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="text-xs font-semibold text-slate-600">
          {fmtShort(task.deadline)}
        </div>
        {task.status === "pending" && (
          <div
            className={clsx(
              "text-xs mt-0.5 font-medium",
              overdue
                ? "text-red-500"
                : days <= 2
                  ? "text-amber-600"
                  : "text-slate-400",
            )}
          >
            {overdue
              ? `${Math.abs(days)} d de retraso`
              : days === 0
                ? "Vence hoy"
                : `${days} d restantes`}
          </div>
        )}
      </td>
      <td className="py-3.5 px-4">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className="py-3.5 px-4">
        <StatusChip status={task.status} />
      </td>
      <td className="py-3.5 px-4 w-10">
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Eliminar tarea"
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

// ─── Add Task Form ────────────────────────────────────────────────────────────

function AddTaskForm({
  onClose,
  onAdd,
  personalCategories,
  inline = false,
}: {
  onClose: () => void;
  onAdd: (task: Task) => void;
  personalCategories: string[];
  inline?: boolean;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    deadline: "",
    priority: "medium" as Priority,
  });
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.title.trim())
      e.title = "El título de la tarea es obligatorio";

    if (!form.category) e.category = "Selecciona una categoría";

    if (!form.deadline)
      e.deadline = "La fecha límite es obligatoria";

    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onAdd({
      id: Date.now().toString(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      deadline: form.deadline,
      priority: form.priority,
      status: "pending",
      createdAt: TODAY_STR,
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      if (inline) {
        setForm({
          title: "",
          description: "",
          category: "",
          deadline: "",
          priority: "medium",
        });
      } else {
        onClose();
      }
    }, 1500);
  };

  const bind = (field: string) => ({
    onChange: (
      e: React.ChangeEvent<
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
      >,
    ) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field])
        setErrors((prev) => {
          const n = { ...prev };
          delete n[field];
          return n;
        });
    },
  });

  const fieldCls = (err?: string) =>
    clsx(
      "w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400 bg-white text-slate-800",
      err ? "border-red-300" : "border-slate-200",
    );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
          <CheckCircle2 size={28} className="text-blue-600" />
        </div>
        <p
          className="text-base font-semibold text-slate-800"
          style={DISPLAY}
        >
          ¡Tarea añadida correctamente!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="f-title"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          Título de la tarea *
        </label>
        <input
          id="f-title"
          type="text"
          placeholder="p. ej., Tarea de Matemáticas n.º 5"
          className={fieldCls(errors.title)}
          value={form.title}
          {...bind("title")}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="f-desc"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          Descripción
        </label>
        <textarea
          id="f-desc"
          placeholder="Añade detalles sobre esta tarea..."
          rows={3}
          className={clsx(fieldCls(), "resize-none")}
          value={form.description}
          {...bind("description")}
        />
      </div>

      {/* Categoría */}
      <div>
        <label
          htmlFor="f-category"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          Categoría *
        </label>

        <select
          id="f-category"
          className={fieldCls(errors.category)}
          value={form.category}
          {...bind("category")}
        >
          <option value="">Selecciona una categoría</option>

          <optgroup label="Categorías predefinidas">
            <option value="Trabajo">Trabajo</option>
            <option value="Estudios">Estudios</option>
            <option value="Hogar">Hogar</option>
            <option value="Finanzas">Finanzas</option>
            <option value="Salud">Salud</option>
            <option value="Compras">Compras</option>
            <option value="Trámites">Trámites</option>
            <option value="Familia">Familia</option>
            <option value="Personal">Personal</option>
            <option value="Recreación">Recreación</option>
          </optgroup>

          <optgroup label="Categorías personales">
            {personalCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </optgroup>
        </select>

        {errors.category && (
          <p className="text-xs text-red-500 mt-1">
            {errors.category}
          </p>
        )}
      </div>

      {/* Fecha límite */}
      <div>
        <label
          htmlFor="f-deadline"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          Fecha límite *
        </label>

        <input
          id="f-deadline"
          type="date"
          min={TODAY_STR}
          className={fieldCls(errors.deadline)}
          value={form.deadline}
          {...bind("deadline")}
        />

        {errors.deadline && (
          <p className="text-xs text-red-500 mt-1">
            {errors.deadline}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Nivel de prioridad
        </label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as Priority[]).map(
            (p) => (
              <button
                key={p}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, priority: p }))
                }

                className={clsx(
                  "flex-1 py-2.5 px-3 rounded-xl border text-sm font-semibold capitalize transition-all",
                  form.priority === p
                    ? p === "high"
                      ? "bg-[#F0DFDF] border-[#BD8490] text-[#AD7381]"
                      : p === "medium"
                        ? "bg-[#F5EBDD] border-[#D6B77A] text-[#9A783D]"
                        : "bg-[#E8F0EB] border-[#729681] text-[#729681]"
                    : "bg-[#FFFCFC] border-[#EADFEA] text-[#817687] hover:bg-[#FAF6F8]",
                )}

              >
                {
                  {
                    low: "Baja",
                    medium: "Media",
                    high: "Alta",
                  }[p]
                }
              </button>
            ),
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        {!inline && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#EADFEA] bg-[#F5EFF6] text-[#80658B] text-sm font-semibold hover:bg-[#E8DDEB] transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={clsx(
            "py-2.5 px-4 rounded-xl bg-[#587594] text-white text-sm font-semibold hover:bg-[#496783] active:bg-[#405B74] transition-colors shadow-sm shadow-[#587594]/20", inline ? "w-full" : "flex-1",
          )}
        >
          Añadir tarea
        </button>
      </div>
    </form>
  );
}

function DashboardView({
  tasks,
  onToggle,
  onDelete,
  onAddTask,
  onNavTo,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
  onNavTo: (p: NavPage) => void;
}) {
  // Resumen de tareas
  const total = tasks.length;
  const pending = tasks.filter(
    (t) => t.status === "pending"
  ).length;
  const completed = tasks.filter(
    (t) => t.status === "completed"
  ).length;
  const overdue = tasks.filter(isOverdue).length;

  const progress = total > 0
    ? Math.round((completed / total) * 100)
    : 0;

  // Próximas tareas pendientes
  const upcomingTasks = tasks
    .filter(
      (t) =>
        t.status === "pending" &&
        t.deadline >= TODAY_STR
    )
    .sort((a, b) =>
      a.deadline.localeCompare(b.deadline)
    )
    .slice(0, 4);

  // Datos del calendario del mes actual
  const year = TODAY.getFullYear();
  const month = TODAY.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Ajustar para que la semana comience el lunes
  const startOffset = (firstDay.getDay() + 6) % 7;

  const calendarDays = Array.from(
    { length: startOffset + daysInMonth },
    (_, index) =>
      index < startOffset ? null : index - startOffset + 1
  );

  const monthName = TODAY.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const hasTasksOnDay = (day: number) => {
    const date = [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

    return tasks.some(
      (t) => t.deadline === date && t.status === "pending"
    );
  };

  return (
    <div className="space-y-6">

      {/* Bienvenida */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            ¡Bienvenido a Mi Gestor de Tareas!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organiza tus actividades y mantén tus tareas al día.
          </p>
        </div>

        <button
          onClick={onAddTask}
          className="px-4 py-2.5 bg-[#587594] text-white rounded-xl text-sm font-medium hover:bg-[#496783] transition-colors shadow-sm"        >
          <Plus size={16} className="inline mr-2" />
          Crear tarea
        </button>
      </div>


      {/* Indicadores principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total de tareas */}
        <div className="bg-[#F0E8F2] border border-[#E8DDEB] rounded-xl p-4">
          <p className="text-sm text-[#80658B]">
            Total de tareas
          </p>
          <p className="text-2xl font-bold text-[#51445C] mt-1">
            {total}
          </p>
        </div>

        {/* Pendientes */}
        <div className="bg-[#E8EEF4] border border-[#DCE6F0] rounded-xl p-4">
          <p className="text-sm text-[#587594]">
            Pendientes
          </p>
          <p className="text-2xl font-bold text-[#405B76] mt-1">
            {pending}
          </p>
        </div>

        {/* Completadas */}
        <div className="bg-[#EAF1EC] border border-[#DCE9DF] rounded-xl p-4">
          <p className="text-sm text-[#729681]">
            Completadas
          </p>
          <p className="text-2xl font-bold text-[#527661] mt-1">
            {completed}
          </p>
        </div>

        {/* Atrasadas */}
        <div className="bg-[#F7EAEA] border border-[#F0DFDF] rounded-xl p-4">
          <p className="text-sm text-[#BD8490]">
            Atrasadas
          </p>
          <p className="text-2xl font-bold text-[#A45F70] mt-1">
            {overdue}
          </p>
        </div>

      </div>


      {/* Progreso general */}
      <div className="bg-[#FFFCFC] border border-[#E8DDEB] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-[#51445C]">
              Progreso general
            </h2>
            <p className="text-sm text-[#817687] mt-1">
              Avance de tus tareas registradas
            </p>
          </div>

          <span className="text-xl font-bold text-[#729681]">
            {progress}%
          </span>
        </div>

        <div className="w-full h-3 bg-[#EAF1EC] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#729681] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-[#817687] mt-2">
          {completed} de {total} tareas completadas
        </p>
      </div>



      {/* Próximas tareas y calendario */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Próximas tareas */}
        <div className="xl:col-span-2 bg-[#FFFCFC] border border-[#F0DFDF] rounded-xl overflow-hidden">

          <div className="flex items-center justify-between p-4 border-b border-[#F0DFDF]">
            <div>
              <h2 className="font-semibold text-[#51445C]">
                Próximas tareas
              </h2>
              <p className="text-xs text-[#817687] mt-1">
                Actividades pendientes por fecha límite
              </p>
            </div>

            <button
              onClick={() => onNavTo("tasks")}
              className="text-sm text-[#587594] hover:underline"
            >
              Ver todas
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-[#817687] p-5">
              No tienes próximas tareas pendientes.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {upcomingTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>


        {/* Calendario pequeño */}
        <div className="bg-[#FFFCFC] border border-[#F0DFDF] rounded-xl p-4">

          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={19} className="text-[#587594]" />
            <h2 className="font-semibold text-[#51445C]">
              Calendario
            </h2>
          </div>

          <p className="text-sm font-semibold text-[#587594] capitalize mb-4">
            {monthName}
          </p>

          <div className="grid grid-cols-7 gap-y-2 text-center">

            {["L", "M", "X", "J", "V", "S", "D"].map(
              (day) => (
                <span
                  key={day}
                  className="text-xs font-semibold text-[#9B8D9F]"
                >
                  {day}
                </span>
              )
            )}

            {calendarDays.map((day, index) => (
              <div
                key={index}
                className="relative flex items-center justify-center h-9"
              >
                {day !== null && (
                  <>
                    <span
                      className={clsx(
                        "w-8 h-8 flex items-center justify-center rounded-full text-sm",
                        day === TODAY.getDate()
                          ? "bg-[#587594] text-white font-semibold"
                          : "text-[#51445C]"
                      )}
                    >
                      {day}
                    </span>

                    {hasTasksOnDay(day) && (
                      <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#BD8490]" />
                    )}
                  </>
                )}
              </div>
            ))}

          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F0DFDF]">
            <span className="w-2 h-2 rounded-full bg-[#BD8490]" />
            <span className="text-xs text-[#817687]">
              Día con tareas pendientes
            </span>
          </div>

        </div>
      </div>

      {/* Accesos a categorías */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onNavTo("add-category")}
          className="px-4 py-2.5 bg-[#BD8490] text-white rounded-lg text-sm font-medium hover:bg-[#AD7381] transition-colors"
        >
          <Plus size={16} className="inline mr-2" />
          Crear categoría
        </button>

        <button
          onClick={() => onNavTo("categories")}
          className="px-4 py-2.5 bg-[#FFFCFC] border border-[#F0DFDF] text-[#51445C] rounded-lg text-sm font-medium hover:bg-[#F7EAEA] transition-colors"
        >
          Consultar categorías
        </button>
      </div>

    </div>
  );

}


// ─── My Tasks View ────────────────────────────────────────────────────────────

function MyTasksView({
  tasks,
  onToggle,
  onDelete,
  onAddTask,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
}) {
  const [search, setSearch] = useState("");
  const [fp, setFp] = useState<Priority | "all">("all");
  const [fs, setFs] = useState<TaskStatus | "all">("all");
  const [sort, setSort] = useState<
    "deadline" | "priority" | "status"
  >("deadline");

  const filtered = useMemo(() => {
    let arr = [...tasks];
    if (search)
      arr = arr.filter(
        (t) =>
          t.title
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          t.category
            .toLowerCase()
            .includes(search.toLowerCase()),
      );
    if (fp !== "all")
      arr = arr.filter((t) => t.priority === fp);
    if (fs !== "all") arr = arr.filter((t) => t.status === fs);
    arr.sort((a, b) => {
      if (sort === "deadline")
        return a.deadline.localeCompare(b.deadline);
      if (sort === "priority") {
        const o = { high: 0, medium: 1, low: 2 };
        return o[a.priority] - o[b.priority];
      }
      return a.status.localeCompare(b.status);
    });
    return arr;
  }, [tasks, search, fp, fs, sort]);

  const selCls =
    "px-3 py-2 rounded-xl border border-[#EADFEA] text-sm text-[#655B6C] bg-[#FFFCFC] focus:outline-none focus:ring-2 focus:ring-[#587594]/20 focus:border-[#829BB3] transition-all cursor-pointer";

  return (
    <div className="space-y-5">

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-2xl font-bold text-[#51445C]"
            style={DISPLAY}
          >
            Mis tareas
          </h1>
          <p className="text-[#817687] text-sm mt-0.5">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "tarea encontrada"
              : "tareas encontradas"}
          </p>
        </div>

        <button
          onClick={onAddTask}
          className="flex items-center gap-2 bg-[#587594] hover:bg-[#496783] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus size={17} />
          Añadir tarea
        </button>
      </div>


      <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-44">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A18FA5]"
          />
          <input
            type="text"
            placeholder="Buscar tareas o asignaturas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EADFEA] text-sm text-[#51445C] bg-[#FAF6F8] placeholder:text-[#A18FA5] focus:outline-none focus:ring-2 focus:ring-[#587594]/20 focus:border-[#829BB3] transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={fp}
            onChange={(e) =>
              setFp(e.target.value as Priority | "all")
            }
            className={selCls}
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
          <select
            value={fs}
            onChange={(e) =>
              setFs(e.target.value as TaskStatus | "all")
            }
            className={selCls}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>
          <select
            value={sort}
            onChange={(e) =>
              setSort(
                e.target.value as
                "deadline" | "priority" | "status",
              )
            }
            className={selCls}
          >
            <option value="deadline">
              Ordenar: fecha límite
            </option>
            <option value="priority">Ordenar: prioridad</option>
            <option value="status">Ordenar: estado</option>
          </select>
        </div>
      </div>

      <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-[#F0E8F2] rounded-full flex items-center justify-center mx-auto mb-3">
              <ListTodo size={20} className="text-[#80658B]" />
            </div>
            <p className="text-[#817687] text-sm font-medium">
              No se encontraron tareas
            </p>
            <p className="text-[#A18FA5] text-xs mt-1">
              Prueba a ajustar los filtros
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0DFDF] bg-[#FAF6F8]">
                  <th className="text-left py-3 px-4 text-xs font-semibold  text-[#80658B] uppercase tracking-wide">
                    Tarea
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#80658B]uppercase tracking-wide">
                    Fecha límite
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#80658B] uppercase tracking-wide">
                    Prioridad
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#80658B] uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


function CompletedTasksView({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const completedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status === "completed")
        .sort((a, b) => b.deadline.localeCompare(a.deadline)),
    [tasks]
  );

  const completedCategories = new Set(
    completedTasks.map((task) => task.category)
  ).size;

  const highPriorityTasks = completedTasks.filter(
    (task) => task.priority === "high"
  ).length;

  return (
    <div className="w-full max-w-none space-y-6">

      {/* Encabezado */}
      <div>
        <h1
          className="text-2xl font-bold text-[#51445C]"
          style={DISPLAY}
        >
          Tareas completadas
        </h1>
        <p className="text-[#817687] text-sm mt-1">
          Consulta tu historial y revisa las actividades que has finalizado.
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-[#F0E8F2] border border-[#E8DDEB] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#80658B]">
              Tareas finalizadas
            </p>
            <CheckCircle2 size={20} className="text-[#80658B]" />
          </div>
          <p className="text-3xl font-bold text-[#51445C] mt-3">
            {completedTasks.length}
          </p>
          <p className="text-xs text-[#817687] mt-1">
            Total de actividades completadas
          </p>
        </div>

        <div className="bg-[#E8EEF4] border border-[#DCE6F0] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#587594]">
              Categorías utilizadas
            </p>
            <span className="text-xl text-[#587594]">▦</span>
          </div>
          <p className="text-3xl font-bold text-[#405B76] mt-3">
            {completedCategories}
          </p>
          <p className="text-xs text-[#817687] mt-1">
            Categorías con tareas finalizadas
          </p>
        </div>

        <div className="bg-[#EAF1EC] border border-[#DCE9DF] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#729681]">
              Prioridad alta
            </p>
            <span className="text-xl text-[#729681]">↑</span>
          </div>
          <p className="text-3xl font-bold text-[#527661] mt-3">
            {highPriorityTasks}
          </p>
          <p className="text-xs text-[#817687] mt-1">
            Tareas importantes finalizadas
          </p>
        </div>

      </div>

      {/* Historial */}
      <div className="space-y-3">
        <div>
          <h2 className="font-semibold text-[#51445C] text-lg">
            Historial de tareas
          </h2>
          <p className="text-sm text-[#817687] mt-1">
            Aquí puedes consultar todas tus actividades finalizadas.
          </p>
        </div>

        <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] overflow-hidden">

          {completedTasks.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-[#EAF1EC] rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={20} className="text-[#729681]" />
              </div>
              <p className="text-[#51445C] text-sm font-medium">
                Todavía no tienes tareas completadas
              </p>
              <p className="text-[#817687] text-xs mt-1">
                Las tareas que finalices aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F0DFDF] bg-[#FAF6F8]">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#80658B] uppercase tracking-wide">
                      Tarea
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#80658B] uppercase tracking-wide">
                      Fecha límite
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#80658B] uppercase tracking-wide">
                      Prioridad
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#80658B] uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {completedTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}


function CalendarView({
  tasks,
  onToggle,
  onDelete,
  onAddTask,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
}) {
  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(TODAY_STR);

  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Ajustar el calendario para que comience el lunes
  const firstDayOffset =
    (new Date(year, month, 1).getDay() + 6) % 7;

  const calendarDays: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1
    ),
  ];

  const getDateKey = (day: number) =>
    [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

  const selectedTasks = tasks.filter(
    (task) => task.deadline === selectedDate
  );

  const monthName = displayedMonth.toLocaleDateString(
    "es-ES",
    {
      month: "long",
      year: "numeric",
    }
  );

  const selectedDateLabel = new Date(
    selectedDate + "T00:00:00"
  ).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const changeMonth = (amount: number) => {
    const nextMonth = new Date(year, month + amount, 1);

    setDisplayedMonth(nextMonth);

    setSelectedDate(
      [
        nextMonth.getFullYear(),
        String(nextMonth.getMonth() + 1).padStart(2, "0"),
        "01",
      ].join("-")
    );
  };

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Calendario
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulta tus tareas según su fecha límite.
          </p>
        </div>

        <button
          onClick={onAddTask}
          className="px-4 py-2.5 bg-[#587594] text-white rounded-xl text-sm font-medium hover:bg-[#496783] transition-colors shadow-sm"
        >
          <Plus size={16} className="inline mr-2" />
          Crear tarea
        </button>
      </div>

      {/* Calendario */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">

        {/* Navegación entre meses */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Mes anterior"
            className="p-2 rounded-lg border border-[#EADFEA] bg-[#F5EFF6] text-[#80658B] hover:bg-[#E8DDEB] transition-colors"
          >
            <ChevronLeft size={19} />
          </button>

          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {monthName}
          </h2>

          <button
            onClick={() => changeMonth(1)}
            aria-label="Mes siguiente"
            className="p-2 rounded-lg border border-[#EADFEA] bg-[#F5EFF6] text-[#80658B] hover:bg-[#E8DDEB] transition-colors"
          >
            <ChevronRight size={19} />
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
            (day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-slate-400 py-2"
              >
                {day}
              </div>
            )
          )}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-16" />;
            }

            const dateKey = getDateKey(day);

            const dayTasks = tasks.filter(
              (task) => task.deadline === dateKey
            );

            const isSelected = selectedDate === dateKey;
            const isToday = TODAY_STR === dateKey;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={clsx(
                  "min-h-16 rounded-lg flex flex-col items-center justify-center gap-1 border transition-colors",
                  isSelected
                    ? "bg-[#587594] text-white border-[#587594]"
                    : "border-transparent hover:bg-[#F5EFF6] text-[#51445C]",
                  isToday && !isSelected && "border-[#829BB3]"
                )}
              >
                <span className="text-sm font-medium">
                  {day}
                </span>

                {dayTasks.length > 0 && (
                  <span
                    className={clsx(
                      "text-xs",
                      isSelected
                        ? "text-slate-200"
                        : "text-blue-600"
                    )}
                  >
                    {dayTasks.length} {dayTasks.length === 1 ? "tarea" : "tareas"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-[#F0DFDF] text-xs text-[#817687]">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded border border-[#829BB3]" />
            Día actual
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#587594]" />
            Día seleccionado
          </span>
        </div>
      </div>

      {/* Tareas del día seleccionado */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800 capitalize">
            {selectedDateLabel}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {selectedTasks.length}{" "}
            {selectedTasks.length === 1
              ? "tarea programada"
              : "tareas programadas"}
          </p>
        </div>

        {selectedTasks.length === 0 ? (
          <p className="text-sm text-slate-500 p-5">
            No tienes tareas programadas para este día.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {selectedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}



function CategoriesView({
  personalCategories,
  onAddCategory,
}: {
  personalCategories: string[];
  onAddCategory: () => void;
}) {
  return (
    <div className="w-full max-w-none space-y-6">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#51445C]">
            Mis categorías
          </h1>
          <p className="text-[#817687] text-sm mt-1">
            Consulta tus categorías predefinidas y personales.
          </p>
        </div>

        <button
          onClick={onAddCategory}
          className="bg-[#BD8490] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#AD7381] transition-colors"
        >
          <Plus size={17} className="inline mr-2" />
          Crear categoría
        </button>
      </div>

      {/* Columnas de categorías */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">

        {/* Categorías predefinidas */}
        <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-6">
          <h2 className="font-semibold text-[#51445C] mb-2">
            Categorías predefinidas
          </h2>

          <p className="text-sm text-[#817687] mb-5">
            Estas categorías vienen incluidas para ayudarte a organizar tus actividades.
          </p>

          <div className="flex flex-wrap gap-3">
            {PREDEFINED_CATEGORIES.map((category) => (
              <span
                key={category}
                className="px-4 py-3 rounded-xl bg-[#F0E8F2] border border-[#E8DDEB] text-[#80658B] text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Categorías personales */}
        <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-6">
          <h2 className="font-semibold text-[#51445C] mb-2">
            Categorías personales
          </h2>

          <p className="text-sm text-[#817687] mb-5">
            Aquí encontrarás las categorías que has creado para tus propias necesidades.
          </p>

          {personalCategories.length === 0 ? (
            <div className="bg-[#FAF6F8] border border-[#EADFEA] rounded-xl p-6 text-center">
              <p className="text-[#80658B] font-medium text-sm">
                Aún no tienes categorías personales.
              </p>
              <p className="text-[#817687] text-sm mt-2">
                Crea una categoría para comenzar a organizar tus actividades.
              </p>
              <button
                onClick={onAddCategory}
                className="mt-4 text-sm font-semibold text-[#BD8490] hover:text-[#AD7381]"
              >
                + Crear mi primera categoría
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {personalCategories.map((category) => (
                <span
                  key={category}
                  className="px-4 py-3 rounded-xl bg-[#F7EAEA] border border-[#F0DFDF] text-[#A45F70] text-sm font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recomendaciones */}
        <div className="xl:col-span-2 bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-5">
          <h2 className="font-semibold text-[#51445C] mb-4">
            Organiza tus categorías de manera sencilla
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="font-semibold text-[#587594]">
                Clasifica tus actividades
              </p>
              <p className="text-sm text-[#817687] mt-1">
                Agrupa tareas que tengan una temática o propósito similar.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#80658B]">
                Personaliza tu organización
              </p>
              <p className="text-sm text-[#817687] mt-1">
                Crea categorías que se adapten a tus actividades y necesidades.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#729681]">
                Mantén el orden
              </p>
              <p className="text-sm text-[#817687] mt-1">
                Utiliza categorías claras para encontrar tus tareas fácilmente.
              </p>
            </div>
          </div>


        </div>


        {/* Guía visual de categorías */}
        <div className="xl:col-span-2 bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-[#51445C] text-lg">
              ¿Cómo aprovechar tus categorías?
            </h2>
            <p className="text-sm text-[#817687] mt-1">
              Sigue estos tres pasos para mantener tus actividades organizadas.
            </p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F0E8F2] rounded-2xl p-5">
              <span className="text-[#80658B] font-bold text-lg">01</span>
              <h3 className="font-semibold text-[#80658B] mt-3">
                Identifica tus actividades
              </h3>
              <p className="text-sm text-[#817687] mt-2">
                Reconoce los diferentes ámbitos de tu vida: estudios,
                trabajo, hogar y actividades personales.
              </p>
            </div>

            <div className="bg-[#E8EEF4] rounded-2xl p-5">
              <span className="text-[#587594] font-bold text-lg">02</span>
              <h3 className="font-semibold text-[#587594] mt-3">
                Selecciona una categoría
              </h3>
              <p className="text-sm text-[#817687] mt-2">
                Utiliza una categoría predefinida o crea una personal
                según tus necesidades.
              </p>
            </div>

            <div className="bg-[#EAF1EC] rounded-2xl p-5">
              <span className="text-[#729681] font-bold text-lg">03</span>
              <h3 className="font-semibold text-[#729681] mt-3">
                Organiza tus tareas
              </h3>
              <p className="text-sm text-[#817687] mt-2">
                Asigna una categoría a cada tarea para facilitar
                su consulta y seguimiento.
              </p>
            </div>
          </div>
        </div>

        {/* Ejemplos de categorías */}
        <div className="xl:col-span-2 bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-[#51445C] text-lg">
              Ejemplos de categorías en acción
            </h2>
            <p className="text-sm text-[#817687] mt-1">
              Descubre cómo puedes clasificar diferentes actividades de tu día a día.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="bg-[#F0E8F2] rounded-2xl p-5">
              <div className="text-2xl mb-3">📚</div>
              <h3 className="font-semibold text-[#80658B]">Estudios</h3>
              <ul className="text-sm text-[#817687] mt-2 space-y-1 list-disc pl-4">
                <li>Preparar una exposición</li>
                <li>Entregar un trabajo</li>
                <li>Estudiar para un examen</li>
              </ul>
            </div>

            <div className="bg-[#E8EEF4] rounded-2xl p-5">
              <div className="text-2xl mb-3">💼</div>
              <h3 className="font-semibold text-[#587594]">Trabajo</h3>
              <ul className="text-sm text-[#817687] mt-2 space-y-1 list-disc pl-4">
                <li>Elaborar un informe</li>
                <li>Asistir a una reunión</li>
                <li>Revisar proyectos</li>
              </ul>
            </div>

            <div className="bg-[#EAF1EC] rounded-2xl p-5">
              <div className="text-2xl mb-3">🏠</div>
              <h3 className="font-semibold text-[#729681]">Hogar</h3>
              <ul className="text-sm text-[#817687] mt-2 space-y-1 list-disc pl-4">
                <li>Organizar la habitación</li>
                <li>Hacer compras</li>
                <li>Limpiar la casa</li>
              </ul>
            </div>

            <div className="bg-[#F7EAEA] rounded-2xl p-5">
              <div className="text-2xl mb-3">❤️</div>
              <h3 className="font-semibold text-[#A45F70]">Personal</h3>
              <ul className="text-sm text-[#817687] mt-2 space-y-1 list-disc pl-4">
                <li>Realizar ejercicio</li>
                <li>Leer un libro</li>
                <li>Programar una cita</li>
              </ul>
            </div>

          </div>
        </div>


      </div>
    </div>
  );
}


// ─── Add Task View ────────────────────────────────────────────────────────────

function AddTaskView({
  onAdd,
  personalCategories,
}: {
  onAdd: (t: Task) => void;
  personalCategories: string[];
}) {
  return (
    <div className="w-full max-w-none space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-slate-900"
          style={DISPLAY}
        >
          Añadir nueva tarea
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Organiza una nueva actividad y establece sus características.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.85fr] gap-5 items-stretch">

        {/* Formulario */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">
            Información de la tarea
          </h2>

          <AddTaskForm
            onClose={() => { }}
            onAdd={onAdd}
            personalCategories={personalCategories}
            inline
          />


        </div>

        {/* Panel de orientación */}
        <div className="space-y-4">

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">
              💡 Consejos para organizarte
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-slate-700">
                  Título claro
                </p>
                <p className="text-slate-500 mt-1">
                  Describe brevemente qué necesitas hacer.
                  Utiliza nombres concretos y fáciles de identificar.
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-700">
                  Descripción
                </p>
                <p className="text-slate-500 mt-1">
                  Añade detalles, instrucciones o pasos que te ayuden
                  a recordar qué debes realizar.
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-700">
                  Fecha límite
                </p>
                <p className="text-slate-500 mt-1">
                  Establece una fecha realista para completar la
                  actividad y evitar retrasos.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">
              Ejemplo de una tarea
            </h2>

            <div className="bg-[#F5EFF6] rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-[#817687]">
                  Título
                </p>
                <p className="text-sm font-medium text-[#51445C]">
                  Entregar proyecto de programación
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Descripción
                </p>
                <p className="text-sm text-slate-700">
                  Finalizar el módulo de autenticación y revisar
                  su funcionamiento.
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Categoría
                </p>
                <p className="text-sm text-slate-700">
                  Estudios
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">
              ¿Cómo elegir la prioridad?
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold text-red-600">
                  Alta
                </span>
                <p className="text-slate-500">
                  Actividades urgentes o de gran importancia.
                </p>
              </div>

              <div>
                <span className="font-semibold text-amber-600">
                  Media
                </span>
                <p className="text-slate-500">
                  Actividades importantes que pueden planificarse.
                </p>
              </div>

              <div>
                <span className="font-semibold text-emerald-600">
                  Baja
                </span>
                <p className="text-slate-500">
                  Actividades que pueden esperar.
                </p>
              </div>
            </div>
          </div>

        </div>
        {/* Organización del tiempo */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#F0DFDF] p-5">
          <h2 className="font-semibold text-[#51445C] mb-4">
            Organiza tu tiempo de manera inteligente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="font-semibold text-[#587594]">Planifica con anticipación</p>
              <p className="text-sm text-[#817687] mt-1">
                Distribuye tus actividades y evita dejar todo para el último momento.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#80658B]">Divide las tareas grandes</p>
              <p className="text-sm text-[#817687] mt-1">
                Organiza los trabajos complejos en actividades más pequeñas.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#729681]">Revisa tus pendientes</p>
              <p className="text-sm text-[#817687] mt-1">
                Consulta regularmente tus tareas y actualiza su estado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCategoryView({
  onAdd,
}: {
  onAdd: (category: string) => void;
}) {
  const [category, setCategory] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const name = category.trim();

    if (!name) return;

    onAdd(name);
    setSuccess(true);
    setCategory("");
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Crear categoría
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Registra una categoría personal para organizar tus tareas.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.85fr] gap-5 items-stretch">
        {/* Formulario */}
        <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-7 flex flex-col min-h-[520px]">

          <div className="mb-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#E8DDEB] flex items-center justify-center">
                <ListTodo size={22} className="text-[#80658B]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Información de la categoría
                </h2>
                <p className="text-sm text-slate-500">
                  Personaliza tu organización
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Crea categorías propias para clasificar actividades
              que no encajan en las opciones predefinidas.
              Puedes utilizarlas para organizar proyectos,
              pasatiempos, responsabilidades y otros aspectos
              de tu vida cotidiana.
            </p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5">
              <p className="text-sm text-green-700 font-medium">
                ¡Categoría creada correctamente!
              </p>
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-7">

            <div>
              <label
                htmlFor="category-name"
                className="block text-base font-semibold text-slate-700 mb-3"
              >
                Nombre de la categoría *
              </label>

              <input
                id="category-name"
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSuccess(false);
                }}
                placeholder="Ej. Mascotas"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-base text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
              />

              <p className="text-xs text-slate-400 mt-3">
                Utiliza un nombre corto y fácil de identificar.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-4">
                Algunas ideas para comenzar
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  "🐾 Mascotas",
                  "💡 Proyectos",
                  "📚 Lectura",
                  "✈️ Viajes",
                  "🎨 Pasatiempos",
                ].map((item) => (
                  <span
                    key={item}
                    className="px-4 py-2.5 bg-[#F5EFF6] border border-[#EADFEA] rounded-xl text-sm text-[#80658B]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#587594] text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#496783] transition-colors shadow-sm"
              >
                + Guardar categoría
              </button>
            </div>
          </form>

        </div>

        {/* Panel de orientación */}
        <div className="space-y-4">

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">
              💡 Consejos para crear categorías
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-slate-700">
                  Utiliza nombres claros
                </p>
                <p className="text-slate-500 mt-1">
                  Elige nombres que permitan identificar fácilmente
                  el tipo de actividades que vas a organizar.
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-700">
                  Agrupa actividades similares
                </p>
                <p className="text-slate-500 mt-1">
                  Una categoría puede reunir varias tareas
                  relacionadas con un mismo tema.
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-700">
                  Evita crear categorías innecesarias
                </p>
                <p className="text-slate-500 mt-1">
                  Mantén una organización sencilla para encontrar
                  tus tareas con mayor facilidad.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">
              Ejemplos de categorías personales
            </h2>

            <div className="space-y-2">
              {[
                ["Mascotas", "Citas veterinarias y cuidados"],
                ["Proyectos", "Actividades de proyectos personales"],
                ["Lectura", "Libros y lecturas pendientes"],
                ["Viajes", "Preparativos y planes de viaje"],
              ].map(([name, description]) => (
                <div
                  key={name}
                  className="bg-[#F5EFF6] rounded-xl p-3 border border-[#EADFEA]"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-2">
              ¿Para qué sirven?
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Las categorías personales complementan las categorías
              predefinidas. Puedes utilizarlas para clasificar tareas
              que pertenecen a actividades o intereses particulares.
            </p>
          </div>

        </div>

        {/* Organización de categorías */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#F0DFDF] p-5">
          <h2 className="font-semibold text-[#51445C] mb-4">
            Mantén tus categorías bien organizadas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="font-semibold text-[#587594]">
                Evita duplicados
              </p>
              <p className="text-sm text-[#817687] mt-1">
                Agrupa actividades similares en una misma categoría.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#80658B]">
                Usa nombres claros
              </p>
              <p className="text-sm text-[#817687] mt-1">
                Elige nombres sencillos que te permitan identificar cada categoría.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#729681]">
                Revisa tus categorías
              </p>
              <p className="text-sm text-[#817687] mt-1">
                Actualiza o elimina las categorías que ya no utilices.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}



// ─── Settings View ──────────────────────────────────────────────────────────

function SettingsView() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showConfirmation, setShowConfirmation] =
    useState(false);

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Encabezado */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "#51445C" }}
        >
          Ajustes
        </h1>
        <p className="text-sm mt-1" style={{ color: "#817687" }}>
          Personaliza tus preferencias y consulta la información de tu cuenta.
        </p>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">

        {/* Perfil */}
        <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#E8DDEB] flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <h2 className="font-semibold text-[#51445C]">Perfil</h2>
              <p className="text-xs text-[#817687]">
                Información personal de la cuenta
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#655B6C] mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                defaultValue="Usuario"
                className="w-full border border-[#EADFEA] bg-[#FAF6F8] rounded-xl p-3 text-sm text-[#51445C] focus:outline-none focus:ring-2 focus:ring-[#587594]/20"
              />
            </div>

            <div>
              <label className="block text-sm text-[#655B6C] mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                defaultValue="usuario@correo.com"
                className="w-full border border-[#EADFEA] bg-[#FAF6F8] rounded-xl p-3 text-sm text-[#51445C] focus:outline-none focus:ring-2 focus:ring-[#587594]/20"
              />
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
              <p className="text-xs text-[#817687]">
                Mantén actualizados tus datos personales.
              </p>
              <button
                type="button"
                className="bg-[#587594] text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#496783] transition-colors"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>

        {/* Preferencias */}
        <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#F0DFDF] flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h2 className="font-semibold text-[#51445C]">Preferencias</h2>
              <p className="text-xs text-[#817687]">
                Opciones para personalizar la experiencia
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#F0DFDF]">
            <label className="flex items-center justify-between gap-4 py-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#51445C]">
                  Modo oscuro
                </p>
                <p className="text-xs text-[#817687] mt-1">
                  Cambia la apariencia de la aplicación.
                </p>
              </div>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="w-4 h-4 accent-[#80658B]"
              />
            </label>

            <label className="flex items-center justify-between gap-4 py-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#51445C]">
                  Notificaciones
                </p>
                <p className="text-xs text-[#817687] mt-1">
                  Recibe avisos sobre tus tareas pendientes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#80658B]"
              />
            </label>

            <label className="flex items-center justify-between gap-4 py-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#51445C]">
                  Recordatorios de tareas
                </p>
                <p className="text-xs text-[#817687] mt-1">
                  Mantén presentes tus fechas importantes.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-[#80658B]"
              />
            </label>

            <label className="flex items-center justify-between gap-4 py-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#51445C]">
                  Resumen semanal
                </p>
                <p className="text-xs text-[#817687] mt-1">
                  Consulta un resumen de tu actividad.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-[#80658B]"
              />
            </label>
          </div>
        </div>

        {/* Sesión */}
        <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#F0DFDF] flex items-center justify-center text-xl">
              🔐
            </div>
            <div>
              <h2 className="font-semibold text-[#51445C]">Sesión y seguridad</h2>
              <p className="text-xs text-[#817687]">
                Opciones relacionadas con el acceso a tu cuenta
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#51445C]">
                  Estado de la sesión
                </p>
                <p className="text-xs text-[#817687] mt-1">
                  Sesión iniciada actualmente
                </p>
              </div>
              <span className="text-xs font-medium text-[#729681] bg-[#E8F0EB] px-3 py-1.5 rounded-full">
                Activa
              </span>
            </div>

            <div className="border-t border-[#F0DFDF] pt-4">
              {showConfirmation ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#51445C]">
                    ¿Deseas cerrar tu sesión?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className="border border-[#EADFEA] text-[#655B6C] px-4 py-2 rounded-xl text-sm hover:bg-[#FAF6F8]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className="bg-[#BD8490] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#AD7381]"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm text-[#817687]">
                    Finaliza el acceso a tu cuenta.
                  </p>
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className="border border-[#BD8490] text-[#BD8490] px-4 py-2 rounded-xl text-sm hover:bg-[#F0DFDF] transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="bg-[#F5EFF6] rounded-2xl border border-[#E8DDEB] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#E8DDEB] flex items-center justify-center text-xl">
              💡
            </div>
            <div>
              <h2 className="font-semibold text-[#51445C]">
                Recomendaciones
              </h2>
              <p className="text-xs text-[#817687]">
                Consejos para aprovechar mejor tu gestor
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-lg">🔑</span>
              <div>
                <p className="text-sm font-medium text-[#51445C]">
                  Protege tu información
                </p>
                <p className="text-xs text-[#817687] mt-1">
                  Utiliza datos de acceso seguros y evita compartir información personal.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-sm font-medium text-[#51445C]">
                  Revisa tus preferencias
                </p>
                <p className="text-xs text-[#817687] mt-1">
                  Ajusta tus opciones de acuerdo con tu forma de organizar las actividades.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-lg">🎯</span>
              <div>
                <p className="text-sm font-medium text-[#51445C]">
                  Mantén tus objetivos claros
                </p>
                <p className="text-xs text-[#817687] mt-1">
                  Organiza tus tareas por prioridad y establece fechas límite realistas.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Información de la aplicación */}
      <div className="bg-[#FFFCFC] rounded-2xl border border-[#F0DFDF] p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#E8DDEB] flex items-center justify-center text-3xl shrink-0">
            📋
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-[#51445C] text-lg">
              Mi Gestor de Tareas
            </h2>
            <p className="text-sm text-[#817687] mt-1">
              Una herramienta diseñada para ayudarte a planificar tus actividades,
              organizar tus responsabilidades y aprovechar mejor tu tiempo.
            </p>
            <p className="text-xs text-[#80658B] mt-3 font-medium">
              Versión demostrativa · 2026
            </p>
          </div>

          <div className="md:max-w-xs bg-[#FAF6F8] border border-[#EADFEA] rounded-xl p-4">
            <p className="text-sm font-semibold text-[#51445C] mb-1">
              Próximas mejoras
            </p>
            <p className="text-xs text-[#817687] leading-relaxed">
              Las opciones de perfil, preferencias y seguridad son demostrativas.
              Su funcionamiento real podrá incorporarse en futuras versiones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


const NAV: {
  id: NavPage;
  label: string;
  Icon: React.ElementType;
}[] = [
    { id: "dashboard", label: "Inicio", Icon: LayoutDashboard },
    { id: "tasks", label: "Consultar tareas", Icon: ListTodo },
    { id: "completed", label: "Tareas completadas", Icon: CheckCircle2 },
    { id: "calendar", label: "Calendario", Icon: CalendarDays },
    { id: "add-task", label: "Crear tarea", Icon: Plus },
    {
      id: "categories",
      label: "Consultar categorías",
      Icon: ListTodo,
    },
    { id: "add-category", label: "Crear categoría", Icon: Plus },
    { id: "settings", label: "Ajustes", Icon: Settings },
  ];

// ─── Root App ─────────────────────────────────────────────────────────────────


function HelpSupportView() {
  return (
    <div className="w-full max-w-none space-y-6">

      {/* Encabezado */}
      <div>
        <h1
          className="text-2xl font-bold text-[#51445C]"
          style={DISPLAY}
        >
          Ayuda y soporte
        </h1>
        <p className="text-sm text-[#817687] mt-1">
          Encuentra recomendaciones y recursos para organizar mejor tu tiempo.
        </p>
      </div>

      {/* Presentación */}
      <div className="rounded-2xl overflow-hidden border border-[#E0D9E7] grid grid-cols-1 lg:grid-cols-2 shadow-sm">

        {/* Texto de presentación */}
        <div className="bg-[#F0EDF3] p-8 lg:p-10 flex flex-col justify-center gap-5">

          <span className="inline-flex w-fit items-center rounded-full bg-[#E8DDEB] px-3 py-1.5 text-xs font-bold tracking-wide text-[#80658B]">
            ORGANIZACIÓN PERSONAL
          </span>


          {/* Elementos decorativos */}
          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-[#E8DDEB] flex items-center justify-center text-2xl shadow-sm">
              📚
            </div>

            <div className="w-12 h-12 rounded-xl bg-[#F0DFDF] flex items-center justify-center text-2xl shadow-sm">
              ✏️
            </div>

            <div className="w-12 h-12 rounded-xl bg-[#E8F0EB] flex items-center justify-center text-2xl shadow-sm">
              📝
            </div>

            <div className="w-12 h-12 rounded-xl bg-[#F5EBDD] flex items-center justify-center text-2xl shadow-sm">
              📅
            </div>

          </div>


          <h2
            className="text-2xl lg:text-3xl font-bold leading-tight text-[#51445C]"
            style={DISPLAY}
          >
            Organiza tus actividades y aprovecha mejor tu tiempo
          </h2>

          <p className="text-sm leading-7 text-[#817687]">
            Una buena planificación te permite tener claridad sobre tus
            responsabilidades, establecer prioridades y avanzar poco a poco
            hacia tus objetivos.
          </p>

          <div className="flex items-center gap-2 text-sm font-semibold text-[#729681]">
            <CheckCircle2 size={18} />
            <span>Planifica · Prioriza · Avanza</span>
          </div>

        </div>

        {/* Imagen */}
        <div className="min-h-[280px] lg:min-h-[350px]">
          <img
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=85"
            alt="Espacio de trabajo con materiales para planificar actividades"
            className="w-full h-full min-h-[280px] lg:min-h-[350px] object-cover"
          />
        </div>

      </div>

      {/* Consejos, recursos y soporte */}
      <div className="w-full max-w-none min-w-0 space-y-6">

        <div>
          <h2
            className="text-lg font-bold text-[#51445C]"
            style={DISPLAY}
          >
            Consejos para organizar tus tareas
          </h2>
          <p className="text-sm text-[#817687] mt-1">
            Pequeños hábitos que pueden ayudarte a gestionar mejor tus actividades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Consejo 1 */}
          <div className="bg-[#FFFCFC] border border-[#EADFEA] rounded-2xl p-5">
            <div className="w-11 h-11 rounded-xl bg-[#E8DDEB] flex items-center justify-center text-xl mb-4">
              📅
            </div>
            <h3 className="font-semibold text-[#51445C] mb-2">
              Planifica con anticipación
            </h3>
            <p className="text-sm text-[#817687] leading-relaxed">
              Define qué actividades necesitas realizar y establece fechas
              límite para cada una.
            </p>
          </div>

          {/* Consejo 2 */}
          <div className="bg-[#FFFCFC] border border-[#EADFEA] rounded-2xl p-5">
            <div className="w-11 h-11 rounded-xl bg-[#F0DFDF] flex items-center justify-center text-xl mb-4">
              🎯
            </div>
            <h3 className="font-semibold text-[#51445C] mb-2">
              Establece prioridades
            </h3>
            <p className="text-sm text-[#817687] leading-relaxed">
              Identifica cuáles tareas requieren mayor atención y organiza
              tu tiempo en función de su importancia.
            </p>
          </div>

          {/* Consejo 3 */}
          <div className="bg-[#FFFCFC] border border-[#EADFEA] rounded-2xl p-5">
            <div className="w-11 h-11 rounded-xl bg-[#E8F0EB] flex items-center justify-center text-xl mb-4">
              ✅
            </div>
            <h3 className="font-semibold text-[#51445C] mb-2">
              Avanza paso a paso
            </h3>
            <p className="text-sm text-[#817687] leading-relaxed">
              Divide las actividades grandes en tareas pequeñas y reconoce
              tus avances.
            </p>
          </div>

        </div>

        {/* Formulario de ayuda y soporte */}
        <div className="bg-[#FFFCFC] rounded-2xl border border-[#E0D9E7] overflow-hidden">

          {/* Encabezado del formulario */}
          <div className="bg-[#F0EDF3] p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#E8DDEB] flex items-center justify-center text-2xl">
                💬
              </div>
              <div>
                <h2
                  className="text-xl font-bold text-[#51445C]"
                  style={DISPLAY}
                >
                  ¿Necesitas ayuda?
                </h2>
                <p className="text-sm text-[#817687]">
                  Estamos aquí para escucharte.
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#817687] mt-4">
              Si encontraste un problema, tienes alguna duda o deseas compartir
              una sugerencia, completa el siguiente formulario.
            </p>
          </div>

          {/* Contenido */}
          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Formulario */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-[#51445C] mb-5">
                Enviar una solicitud
              </h3>

              <form className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-[#51445C] mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      placeholder="Escribe tu nombre"
                      className="w-full rounded-xl border border-[#EADFEA] bg-[#FAF6F8] px-4 py-3 text-sm text-[#51445C] placeholder:text-[#A69BA9] focus:outline-none focus:ring-2 focus:ring-[#587594]/20 focus:border-[#829BB3]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#51445C] mb-2">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      className="w-full rounded-xl border border-[#EADFEA] bg-[#FAF6F8] px-4 py-3 text-sm text-[#51445C] placeholder:text-[#A69BA9] focus:outline-none focus:ring-2 focus:ring-[#587594]/20 focus:border-[#829BB3]"
                    />
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-[#51445C] mb-2">
                    Motivo de contacto
                  </label>
                  <select
                    defaultValue=""
                    className="w-full rounded-xl border border-[#EADFEA] bg-[#FAF6F8] px-4 py-3 text-sm text-[#817687] focus:outline-none focus:ring-2 focus:ring-[#587594]/20 focus:border-[#829BB3]"
                  >
                    <option value="" disabled>
                      Selecciona el motivo de tu consulta
                    </option>
                    <option>Reportar un problema técnico</option>
                    <option>Informar un error en la aplicación</option>
                    <option>Solicitar ayuda o información</option>
                    <option>Enviar una sugerencia</option>
                    <option>Compartir una opinión</option>
                    <option>Otro motivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#51445C] mb-2">
                    Asunto
                  </label>
                  <input
                    type="text"
                    placeholder="Resume el motivo de tu mensaje"
                    className="w-full rounded-xl border border-[#EADFEA] bg-[#FAF6F8] px-4 py-3 text-sm text-[#51445C] placeholder:text-[#A69BA9] focus:outline-none focus:ring-2 focus:ring-[#587594]/20 focus:border-[#829BB3]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#51445C] mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Cuéntanos con más detalle qué sucedió o qué te gustaría sugerir..."
                    className="w-full rounded-xl border border-[#EADFEA] bg-[#FAF6F8] px-4 py-3 text-sm text-[#51445C] placeholder:text-[#A69BA9] focus:outline-none focus:ring-2 focus:ring-[#587594]/20 focus:border-[#829BB3] resize-y"
                  />
                </div>

                <button
                  type="button"
                  className="px-6 py-3 rounded-xl bg-[#587594] text-white text-sm font-semibold hover:bg-[#496783] transition-colors shadow-sm"
                >
                  Enviar solicitud
                </button>

                <p className="text-xs text-[#A69BA9]">
                  Formulario demostrativo. El envío de solicitudes estará
                  disponible próximamente.
                </p>

              </form>
            </div>

            {/* Opciones complementarias */}
            <div className="space-y-4">

              <div className="bg-[#F5EFF6] border border-[#EADFEA] rounded-2xl p-5">
                <div className="text-2xl mb-3">⚠️</div>
                <h3 className="font-semibold text-[#51445C] mb-2">
                  ¿Encontraste un problema?
                </h3>
                <p className="text-sm text-[#817687] leading-relaxed mb-4">
                  Ayúdanos a identificar errores o dificultades que afecten
                  tu experiencia en la aplicación.
                </p>
                <span className="text-xs font-semibold text-[#80658B]">
                  Puedes reportarlo mediante el formulario.
                </span>
              </div>

              <div className="bg-[#FAF2F1] border border-[#F0DFDF] rounded-2xl p-5">
                <div className="text-2xl mb-3">💡</div>
                <h3 className="font-semibold text-[#51445C] mb-2">
                  ¿Tienes una sugerencia?
                </h3>
                <p className="text-sm text-[#817687] leading-relaxed mb-4">
                  Tus ideas pueden ayudarnos a mejorar las herramientas
                  y funcionalidades del gestor.
                </p>
                <span className="text-xs font-semibold text-[#BD8490]">
                  ¡Nos interesa conocer tu opinión!
                </span>
              </div>

              <div className="bg-[#E8F0EB] border border-[#D6E5DA] rounded-2xl p-5">
                <div className="text-2xl mb-3">📩</div>
                <h3 className="font-semibold text-[#51445C] mb-2">
                  Atención al usuario
                </h3>
                <p className="text-sm text-[#817687] leading-relaxed">
                  Este espacio está pensado para recibir consultas,
                  comentarios y reportes de los usuarios.
                </p>
              </div>

            </div>



          </div>
          {/* Recursos informativos */}
          <div className="space-y-4">
            <div>
              <h2
                className="text-lg font-bold text-[#51445C]"
                style={DISPLAY}
              >
                Recursos para aprender
              </h2>
              <p className="text-sm text-[#817687] mt-1">
                Explora estas guías y descubre nuevas formas de planificar
                tus actividades y aprovechar tu tiempo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Recurso 1 */}
              <a
                href="https://guiasbib.upo.es/planificacion-y-gestion-del-tiempo/Establecimiento-de-objetivos-y-prioridades"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FFFCFC] border border-[#EADFEA] rounded-2xl p-5 hover:border-[#C8B9CE] hover:shadow-sm transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#E8DDEB] flex items-center justify-center text-xl mb-4">
                  🎯
                </div>
                <h3 className="font-semibold text-[#51445C] mb-2">
                  Objetivos y prioridades
                </h3>
                <p className="text-sm text-[#817687] leading-relaxed mb-4">
                  Aprende a establecer objetivos, identificar tareas
                  importantes y organizar tus prioridades.
                </p>
                <span className="text-sm font-semibold text-[#80658B]">
                  Consultar guía ↗
                </span>
              </a>

              {/* Recurso 2 */}
              <a
                href="https://orientacion.ucr.ac.cr/organizacion-del-tiempo-y-estudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FFFCFC] border border-[#EADFEA] rounded-2xl p-5 hover:border-[#C8B9CE] hover:shadow-sm transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F0DFDF] flex items-center justify-center text-xl mb-4">
                  📅
                </div>
                <h3 className="font-semibold text-[#51445C] mb-2">
                  Organización del tiempo
                </h3>
                <p className="text-sm text-[#817687] leading-relaxed mb-4">
                  Conoce técnicas para crear rutinas, planificar actividades
                  y evitar la procrastinación.
                </p>
                <span className="text-sm font-semibold text-[#BD8490]">
                  Ver recomendaciones ↗
                </span>
              </a>

              {/* Recurso 3 */}
              <a
                href="https://biblioguias.unex.es/tecnicas_de_estudio/organizacion_estudio"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FFFCFC] border border-[#EADFEA] rounded-2xl p-5 hover:border-[#C8B9CE] hover:shadow-sm transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#E8F0EB] flex items-center justify-center text-xl mb-4">
                  📚
                </div>
                <h3 className="font-semibold text-[#51445C] mb-2">
                  Técnicas de planificación
                </h3>
                <p className="text-sm text-[#817687] leading-relaxed mb-4">
                  Descubre métodos para organizar tus estudios, distribuir
                  actividades y alcanzar tus objetivos.
                </p>
                <span className="text-sm font-semibold text-[#729681]">
                  Explorar recursos ↗
                </span>
              </a>

            </div>
          </div>

          {/* Video educativo */}
          <div className="bg-[#FFFCFC] border border-[#E0D9E7] rounded-2xl p-5 lg:p-7 space-y-4">
            <div>
              <h2
                className="text-lg font-bold text-[#51445C]"
                style={DISPLAY}
              >
                Aprende a gestionar mejor tu tiempo
              </h2>
              <p className="text-sm text-[#817687] mt-1">
                Conoce estrategias prácticas para establecer prioridades,
                planificar tus actividades y avanzar hacia tus objetivos.
              </p>
            </div>

            <div className="w-full aspect-video overflow-hidden rounded-xl bg-[#F0EDF3]">
              <iframe
                src="https://www.youtube-nocookie.com/embed/864228rfcv4"
                title="Cómo gestionar bien tu tiempo, según la ciencia"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <p className="text-xs text-[#A69BA9]">
              Video educativo de Sandra González. Contenido externo de YouTube.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}


export default function App() {
  const [page, setPage] = useState<NavPage>("dashboard");
  const [tasks, setTasks] = useState<Task[]>(INIT_TASKS);
  const [personalCategories, setPersonalCategories] = useState<
    string[]
  >([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState<
    "notifications" | "user" | null
  >(null);

  const [showOverdueBanner, setShowOverdueBanner] = useState(true);

  const overdueTasks = tasks.filter(isOverdue);
  useEffect(() => {
    if (overdueTasks.length === 0) {
      setShowOverdueBanner(true);
    }
  }, [overdueTasks.length]);

  const addTask = (t: Task) => setTasks((prev) => [...prev, t]);
  const addCategory = (category: string) =>
    setPersonalCategories((prev) => [...prev, category]);
  const toggleTask = (id: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            status:
              t.status === "completed"
                ? "pending"
                : "completed",
          }
          : t,
      ),
    );
  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const navTo = (p: NavPage) => {
    setPage(p);
    setSidebarOpen(false);
  };

  return (
    <div
      className="flex flex-col h-screen bg-[#EAEAF0] overflow-hidden"
      style={BODY}
    >



      {/* Header general */}
      <header className="h-16 bg-[#F0EDF3] border-b border-[#E0D9E7] flex items-center px-4 lg:px-6 gap-3 flex-shrink-0 z-30">
        {/* Botón para mostrar u ocultar el menú */}
        <button
          onClick={() => {
            if (window.innerWidth >= 1024) {
              setDesktopSidebarOpen((prev) => !prev);
            } else {
              setSidebarOpen((prev) => !prev);
            }
          }}
          aria-label="Mostrar u ocultar menú"
          className="p-2 rounded-xl text-[#80658B] hover:bg-[#F0E8F2] transition-colors"
        >
          <Menu size={21} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-[#587594] rounded-lg flex items-center justify-center">
            <CheckCheck size={16} className="text-white" />
          </div>

          <div>
            <span
              className="text-base font-bold text-[#51445C] whitespace-nowrap"
              style={DISPLAY}
            >
              Mi Gestor De Tareas
            </span>
            <p className="text-[10px] text-[#9B8D9F] hidden sm:block">
              Organiza y gestiona tus tareas
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative flex-1 max-w-md ml-3 lg:ml-8">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A18FA5]"
          />
          <input
            type="text"
            placeholder="Buscar tareas..."
            onKeyDown={(e) => {
              if (e.key === "Enter") navTo("tasks");
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EADFEA] text-sm bg-[#FAF6F8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#587594]/20 focus:border-[#829BB3] transition-all"
          />
        </div>

        {/* Opciones del usuario */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(
                  openMenu === "notifications" ? null : "notifications"
                )
              }
              aria-label="Ver notificaciones"
              className="relative p-2.5 rounded-xl text-[#80658B] hover:bg-[#F0E8F2] transition-colors"
            >
              <Bell size={20} />

              {overdueTasks.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {openMenu === "notifications" && (
              <div className="absolute right-0 top-12 w-80 bg-[#FFFCFC] border border-[#F0DFDF] rounded-xl shadow-lg z-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#51445C]">
                    Notificaciones
                  </h3>
                  <span className="text-xs text-[#9B8D9F]">
                    {overdueTasks.length} atrasadas
                  </span>
                </div>

                {overdueTasks.length === 0 ? (
                  <p className="text-sm text-[#817687] py-4 text-center">
                    No tienes tareas atrasadas.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {overdueTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-2 border-b border-[#F3E9ED] pb-3"
                      >
                        <AlertTriangle
                          size={17}
                          className="text-red-500 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-[#51445C]">
                            Tarea vencida
                          </p>
                          <p className="text-xs text-[#817687]">
                            {task.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setOpenMenu(null);
                    navTo("tasks");
                  }}
                  className="w-full text-sm text-[#587594] font-medium mt-3 pt-3 border-t border-[#F3E9ED] hover:underline"
                >
                  Consultar tareas
                </button>
              </div>
            )}
          </div>

          {/* Usuario */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(openMenu === "user" ? null : "user")
              }
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#F0E8F2] transition-colors"
            >
              <UserRound size={20} className="text-[#587594]" />
              <span className="text-sm font-medium text-[#51445C] hidden sm:block">
                Usuario
              </span>
              <ChevronDown size={15} className="text-[#9B8D9F]" />
            </button>

            {openMenu === "user" && (
              <div className="absolute right-0 top-12 w-48 bg-[#FFFCFC] border border-[#F0DFDF] rounded-xl shadow-lg z-50 p-2">
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    navTo("settings");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#51445C] hover:bg-[#F0E8F2]"
                >
                  Mi perfil
                </button>

                <button
                  onClick={() => {
                    setOpenMenu(null);
                    navTo("settings");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#51445C] hover:bg-[#F0E8F2]"
                >
                  Ajustes
                </button>
              </div>
            )}
          </div>
        </div>
      </header>



      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex-shrink-0",
            desktopSidebarOpen
              ? "lg:w-64"
              : "lg:w-0 lg:overflow-hidden lg:border-r-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >



          {/* Nav */}
          <nav className="flex-1 px-3 py-5 overflow-y-auto flex flex-col">

            {/* Grupo general */}
            <div className="mb-7">
              <p className="px-3 mb-3 text-[10px] font-bold tracking-widest text-[#80658B]">
                GENERAL
              </p>

              {NAV.filter(({ id }) =>
                ["dashboard", "calendar", "completed"].includes(id)
              ).map(({ id, label, Icon }) => {
                const active = page === id;

                const iconColor =
                  id === "calendar" ? "text-[#587594]" :
                    id === "completed" ? "text-[#729681]" :
                      "text-[#80658B]";

                return (
                  <button
                    key={id}
                    onClick={() => navTo(id)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-xl text-sm font-medium transition-all",
                      active
                        ? "bg-[#E8DDEB] text-[#51445C] font-semibold"
                        : "text-[#655B6C] hover:bg-[#F0E8F2] hover:text-[#51445C]",
                    )}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-[#80658B]" : iconColor}
                    />
                    <span className="flex-1 text-left">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Grupo tareas */}
            <div className="mb-7">
              <p className="px-3 mb-3 text-[10px] font-bold tracking-widest text-[#80658B]">
                TAREAS
              </p>

              {NAV.filter(({ id }) =>
                ["tasks", "add-task"].includes(id)
              ).map(({ id, label, Icon }) => {
                const active = page === id;
                const isAdd = id === "add-task";

                return (
                  <button
                    key={id}
                    onClick={() => navTo(id)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-xl text-sm font-medium transition-all",
                      isAdd
                        ? "bg-[#587594] text-white hover:bg-[#496783] font-semibold shadow-sm"
                        : active
                          ? "bg-[#E8DDEB] text-[#51445C] font-semibold"
                          : "text-[#655B6C] hover:bg-[#F0E8F2] hover:text-[#51445C]",
                    )}
                  >
                    <Icon
                      size={18}
                      className={
                        isAdd ? "text-white" :
                          active ? "text-[#80658B]" :
                            "text-[#80658B]"
                      }
                    />
                    <span className="flex-1 text-left">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Grupo categorías */}
            <div>
              <p className="px-3 mb-3 text-[10px] font-bold tracking-widest text-[#BD8490]">
                CATEGORÍAS
              </p>

              {NAV.filter(({ id }) =>
                ["categories", "add-category"].includes(id)
              ).map(({ id, label, Icon }) => {
                const active = page === id;
                const isAdd = id === "add-category";

                return (
                  <button
                    key={id}
                    onClick={() => navTo(id)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-xl text-sm font-medium transition-all",
                      isAdd
                        ? "bg-[#BD8490] text-white hover:bg-[#AD7381] font-semibold shadow-sm"
                        : active
                          ? "bg-[#F0DFDF] text-[#704F5A] font-semibold"
                          : "text-[#655B6C] hover:bg-[#F7EAEA] hover:text-[#704F5A]",
                    )}
                  >
                    <Icon
                      size={18}
                      className={
                        isAdd ? "text-white" :
                          active ? "text-[#BD8490]" :
                            "text-[#BD8490]"
                      }
                    />
                    <span className="flex-1 text-left">{label}</span>
                  </button>
                );
              })}
            </div>

          </nav>


          {/* Bottom */}
          <div className="px-3 py-4 border-t border-[#F0DFDF] space-y-3">

            {/* Tarjeta de consejo */}
            <div className="rounded-xl bg-[#F5EFF6] border border-[#EADFEA] p-3">
              <p className="text-xs font-semibold text-[#51445C] mb-1">
                ¡Organiza tu día!
              </p>
              <p className="text-[11px] leading-relaxed text-[#817687]">
                Prioriza tus tareas y avanza paso a paso hacia tus objetivos.
              </p>
            </div>

            {/* Ayuda y soporte */}
            <button
              type="button"
              onClick={() => setPage("help")}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                page === "help"
                  ? "bg-[#E8DDEB] text-[#80658B] font-semibold"
                  : "text-[#655B6C] hover:bg-[#F5EFF6] hover:text-[#80658B]"
              )}
            >
              <HelpCircle size={18} className="text-[#80658B]" />
              <span>Ayuda y soporte</span>
            </button>

            {/* Ajustes */}
            <button
              onClick={() => navTo("settings")}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                page === "settings"
                  ? "bg-[#E8DDEB] text-[#80658B] font-semibold"
                  : "text-[#655B6C] hover:bg-[#F5EFF6] hover:text-[#80658B]",
              )}
            >
              <Settings size={18} className="text-slate-400" />
              <span>Ajustes</span>
            </button>

          </div>


          {/* Botón flotante para controlar la barra lateral */}
          <button
            onClick={() =>
              setDesktopSidebarOpen(!desktopSidebarOpen)
            }
            aria-label={
              desktopSidebarOpen
                ? "Ocultar menú lateral"
                : "Mostrar menú lateral"
            }
            title={
              desktopSidebarOpen
                ? "Ocultar menú"
                : "Mostrar menú"
            }
            className={clsx(
              "hidden lg:flex fixed top-1/2 -translate-y-1/2 z-[60]",
              "w-9 h-9 items-center justify-center",
              "bg-[#FFFCFC] border border-[#EADFEA] rounded-xl",
              "shadow-lg text-[#80658B] hover:text-[#587594]",
              "hover:bg-[#F5EFF6] hover:shadow-xl",
              "transition-all duration-300 ease-in-out",
              desktopSidebarOpen ? "left-[246px]" : "left-3",
            )}
          >
            {desktopSidebarOpen ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">


          {/* Overdue banner */}
          {overdueTasks.length > 0 &&
            page === "dashboard" &&
            showOverdueBanner && (
              <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center gap-2">
                <AlertTriangle
                  size={24}
                  className="text-red-500 flex-shrink-0"
                />

                <p className="text-lg text-slate-700 flex-1 leading-relaxed">
                  <strong>
                    {overdueTasks.length}{" "}
                    {overdueTasks.length === 1
                      ? "tarea está atrasada"
                      : "tareas están atrasadas"}
                    .
                  </strong>{" "}
                  {overdueTasks
                    .slice(0, 2)
                    .map((t) => t.title)
                    .join(", ")}
                  {overdueTasks.length > 2 &&
                    ` y ${overdueTasks.length - 2} más`}
                  .
                </p>

                <button
                  type="button"
                  onClick={() => setShowOverdueBanner(false)}
                  aria-label="Cerrar aviso de tareas atrasadas"
                  className="ml-2 p-1 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setShowOverdueBanner(false)}
                    aria-label="Cerrar aviso de tareas atrasadas"
                    className="ml-2 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors text-2xl font-semibold"
                  >
                    ×
                  </button>
                </button>
              </div>
            )}
          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {page === "dashboard" && (
              <DashboardView
                tasks={tasks}

                onToggle={toggleTask}
                onDelete={deleteTask}
                onAddTask={() => navTo("add-task")}
                onNavTo={navTo}
              />
            )}
            {page === "completed" && (
              <CompletedTasksView
                tasks={tasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            )}

            {page === "tasks" && (
              <MyTasksView
                tasks={tasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onAddTask={() => navTo("add-task")}
              />
            )}

            {page === "calendar" && (
              <CalendarView
                tasks={tasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onAddTask={() => navTo("add-task")}
              />
            )}

            {page === "add-task" && (
              <AddTaskView
                onAdd={addTask}
                personalCategories={personalCategories}
              />
            )}

            {page === "categories" && (
              <CategoriesView
                personalCategories={personalCategories}
                onAddCategory={() => navTo("add-category")}
              />
            )}

            {page === "add-category" && (
              <AddCategoryView onAdd={addCategory} />
            )}
            {page === "settings" && <SettingsView />}
            {page === "help" && <HelpSupportView />}


            {/* Pie de página global */}
            <footer className="mt-10 -mx-4 -mb-4 lg:-mx-6 lg:-mb-6 bg-[#51445C] text-white">

              <div className="px-6 py-8 lg:px-8">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                  {/* Identidad de la aplicación */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#587594] flex items-center justify-center">
                        <CheckCheck size={19} className="text-white" />
                      </div>

                      <h2
                        className="text-lg font-bold"
                        style={DISPLAY}
                      >
                        Mi Gestor de Tareas
                      </h2>
                    </div>

                    <p className="text-sm text-[#E8DDEB] leading-relaxed max-w-sm">
                      Organiza tus actividades, establece prioridades
                      y aprovecha mejor tu tiempo.
                    </p>
                  </div>

                  {/* Navegación */}
                  <div>
                    <h3 className="font-semibold text-sm mb-4">
                      Explora la aplicación
                    </h3>

                    <div className="flex flex-col items-start gap-2.5">
                      <button
                        onClick={() => navTo("dashboard")}
                        className="text-sm text-[#E8DDEB] hover:text-white transition-colors"
                      >
                        Inicio
                      </button>

                      <button
                        onClick={() => navTo("tasks")}
                        className="text-sm text-[#E8DDEB] hover:text-white transition-colors"
                      >
                        Mis tareas
                      </button>

                      <button
                        onClick={() => navTo("calendar")}
                        className="text-sm text-[#E8DDEB] hover:text-white transition-colors"
                      >
                        Calendario
                      </button>

                      <button
                        onClick={() => navTo("categories")}
                        className="text-sm text-[#E8DDEB] hover:text-white transition-colors"
                      >
                        Categorías
                      </button>
                    </div>
                  </div>

                  {/* Ayuda */}
                  <div>
                    <h3 className="font-semibold text-sm mb-4">
                      Ayuda y orientación
                    </h3>

                    <div className="flex flex-col items-start gap-2.5">
                      <button
                        onClick={() => navTo("help")}
                        className="text-sm text-[#E8DDEB] hover:text-white transition-colors"
                      >
                        Ayuda y soporte
                      </button>

                      <button
                        onClick={() => navTo("settings")}
                        className="text-sm text-[#E8DDEB] hover:text-white transition-colors"
                      >
                        Ajustes
                      </button>
                    </div>

                    <p className="text-xs text-[#CFC3D5] mt-5 leading-relaxed">
                      Una herramienta para mejorar tu organización
                      y planificación personal.
                    </p>
                  </div>

                </div>

                {/* Separador y derechos de autor */}
                <div className="border-t border-[#817687] mt-8 pt-5 flex flex-col sm:flex-row justify-between gap-3">

                  <p className="text-xs text-[#E8DDEB]">
                    Proyecto académico · Ingeniería de Software
                  </p>

                  <p className="text-xs text-[#CFC3D5]">
                    © 2026 Mi Gestor de Tareas. Desarrollado con fines educativos.
                  </p>

                </div>

              </div>
            </footer>

          </main>

        </div>
      </div >
    </div >
  );
}