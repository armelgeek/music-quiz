CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'host');--> statement-breakpoint
CREATE TABLE "quiz_host_answers" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_session_id" text NOT NULL,
	"participant_id" text NOT NULL,
	"question_id" text NOT NULL,
	"user_answer" text,
	"is_correct" boolean NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_host_participants" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_session_id" text NOT NULL,
	"user_id" text,
	"participant_name" text NOT NULL,
	"current_score" integer DEFAULT 0 NOT NULL,
	"is_connected" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_host_sessions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_user_id" text NOT NULL,
	"category_id" text,
	"session_name" text NOT NULL,
	"session_code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"max_participants" integer DEFAULT 50 NOT NULL,
	"questions" jsonb,
	"settings" jsonb,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_host_sessions_session_code_unique" UNIQUE("session_code")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_host_answers" ADD CONSTRAINT "quiz_host_answers_host_session_id_quiz_host_sessions_id_fk" FOREIGN KEY ("host_session_id") REFERENCES "public"."quiz_host_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_host_answers" ADD CONSTRAINT "quiz_host_answers_participant_id_quiz_host_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."quiz_host_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_host_answers" ADD CONSTRAINT "quiz_host_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_host_participants" ADD CONSTRAINT "quiz_host_participants_host_session_id_quiz_host_sessions_id_fk" FOREIGN KEY ("host_session_id") REFERENCES "public"."quiz_host_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_host_participants" ADD CONSTRAINT "quiz_host_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_host_sessions" ADD CONSTRAINT "quiz_host_sessions_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_host_sessions" ADD CONSTRAINT "quiz_host_sessions_category_id_quiz_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."quiz_categories"("id") ON DELETE no action ON UPDATE no action;