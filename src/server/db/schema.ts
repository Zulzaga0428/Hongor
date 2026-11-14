import { customType, integer, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  pinHash: text("pin_hash").notNull(),
  /**
   * student — сурагч · teacher — хэлний багш · admin — платформын эзэн (бүх байгууллагыг харна)
   * org — хамтрагч байгууллагын ажилтан (зөвхөн өөрийн org_id-д оноогдсон хүмүүс)
   */
  role: text("role").notNull().default("student"),
  /** anhan | dund | ahisan */
  level: text("level").notNull().default("anhan"),
  /** role=org үед заавал — аль байгууллагын ажилтан вэ */
  orgId: text("org_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Хамтрагч байгууллага (лицензтэй зуучлал) — тус бүр өөрийн самбартай. */
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  /** Аль улс руу явуулдаг вэ — "korea,japan" */
  countries: text("countries").notNull().default(""),
  active: integer("active").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    /** Хамгийн өндөр оноо — дахин өгөхөд буурахгүй. */
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const assignments = pgTable("assignments", {
  id: text("id").primaryKey(),
  level: text("level").notNull(),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const submissions = pgTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    answer: text("answer").notNull(),
    score: integer("score"),
    feedback: text("feedback"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    gradedAt: timestamp("graded_at", { withTimezone: true }),
  },
  (t) => [unique().on(t.assignmentId, t.userId)],
);

export type User = typeof users.$inferSelect;

// ---------------- Горилогчийн материал ----------------

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType: () => "bytea",
});

/** Сурагч бүрт нэг анкет. Хэлний сургалт ба явуулах ажил хоёрыг нэг хүнд холбоно. */
export const applicants = pgTable("applicants", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  country: text("country"),
  program: text("program"),
  jobType: text("job_type"),
  lastName: text("last_name"),
  firstName: text("first_name"),
  birthDate: text("birth_date"),
  gender: text("gender"),
  address: text("address"),
  education: text("education"),
  experience: text("experience"),
  heightCm: integer("height_cm"),
  weightKg: integer("weight_kg"),
  emergencyName: text("emergency_name"),
  emergencyPhone: text("emergency_phone"),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  stage: text("stage").notNull().default("registered"),
  stageAt: timestamp("stage_at", { withTimezone: true }).notNull().defaultNow(),
  /** Зөвхөн ажилтнуудад харагдана. */
  staffNote: text("staff_note"),
  /** Аль байгууллага хариуцаж байна. Нэг удаад нэг. null = хуваарилаагүй. */
  orgId: text("org_id"),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  /** pending | ok | rejected */
  status: text("status").notNull().default("pending"),
  note: text("note"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stageEvents = pgTable("stage_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  note: text("note"),
  byName: text("by_name"),
  /** Аль байгууллагын ажилтан хийсэн (null = платформ/систем). Бусад байгууллагаас тайлбарыг нуухад. */
  orgId: text("org_id"),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});

export type Applicant = typeof applicants.$inferSelect;
