--
-- PostgreSQL database dump
--

\restrict 0arJyeZ7qdppdMvOpch41euMLmhAFi8q6yqWnzmKYYsTVyNb2wioyonTfDFt5Es

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: announcementtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.announcementtype AS ENUM (
    'info',
    'warning',
    'maintenance'
);


ALTER TYPE public.announcementtype OWNER TO postgres;

--
-- Name: approvalstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.approvalstatus AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.approvalstatus OWNER TO postgres;

--
-- Name: bankaccountstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bankaccountstatus AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.bankaccountstatus OWNER TO postgres;

--
-- Name: campaignstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.campaignstatus AS ENUM (
    'draft',
    'pending_approval',
    'active',
    'paused',
    'completed',
    'rejected',
    'cancelled'
);


ALTER TYPE public.campaignstatus OWNER TO postgres;

--
-- Name: campaigntype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.campaigntype AS ENUM (
    'featured_course',
    'banner_ad'
);


ALTER TYPE public.campaigntype OWNER TO postgres;

--
-- Name: coupontriggertype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.coupontriggertype AS ENUM (
    'first_purchase',
    'cart_value',
    'category',
    'manual',
    'site_wide'
);


ALTER TYPE public.coupontriggertype OWNER TO postgres;

--
-- Name: coupontype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.coupontype AS ENUM (
    'percentage',
    'fixed'
);


ALTER TYPE public.coupontype OWNER TO postgres;

--
-- Name: coursestatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.coursestatus AS ENUM (
    'draft',
    'published',
    'archived',
    'pending_review',
    'rejected'
);


ALTER TYPE public.coursestatus OWNER TO postgres;

--
-- Name: earningtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.earningtype AS ENUM (
    'earning',
    'withdrawal',
    'adjustment',
    'commission',
    'ad_spend'
);


ALTER TYPE public.earningtype OWNER TO postgres;

--
-- Name: emailstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.emailstatus AS ENUM (
    'pending',
    'sent',
    'failed',
    'retrying'
);


ALTER TYPE public.emailstatus OWNER TO postgres;

--
-- Name: lessontype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lessontype AS ENUM (
    'video',
    'pdf',
    'quiz',
    'document',
    'presentation',
    'live_lesson',
    'text'
);


ALTER TYPE public.lessontype OWNER TO postgres;

--
-- Name: moderationactiontype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.moderationactiontype AS ENUM (
    'submit_for_review',
    'approve',
    'reject',
    'edit',
    'resubmit',
    'archive',
    'unarchive'
);


ALTER TYPE public.moderationactiontype OWNER TO postgres;

--
-- Name: notificationpriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notificationpriority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE public.notificationpriority OWNER TO postgres;

--
-- Name: notificationtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notificationtype AS ENUM (
    'course_update',
    'new_lesson',
    'course_announcement',
    'org_announcement',
    'org_course_update',
    'admin_to_teacher',
    'system_announcement',
    'maintenance',
    'live_lesson_reminder',
    'live_lesson_starting',
    'live_lesson_cancelled',
    'order_confirmed',
    'payment_success',
    'certificate_earned',
    'course_submitted',
    'course_approved',
    'course_rejected',
    'course_resubmitted',
    'password_reset',
    'bank_account_pending',
    'bank_account_approved',
    'bank_account_rejected',
    'withdrawal_request_created',
    'withdrawal_approved',
    'withdrawal_rejected',
    'withdrawal_paid',
    'review_approved',
    'review_rejected',
    'teacher_reply',
    'ad_campaign_approved',
    'ad_campaign_rejected',
    'new_message'
);


ALTER TYPE public.notificationtype OWNER TO postgres;

--
-- Name: orderstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orderstatus AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'cancelled'
);


ALTER TYPE public.orderstatus OWNER TO postgres;

--
-- Name: paymentmethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.paymentmethod AS ENUM (
    'credit_card',
    'eft',
    'manual'
);


ALTER TYPE public.paymentmethod OWNER TO postgres;

--
-- Name: paymentstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.paymentstatus AS ENUM (
    'pending',
    'paid',
    'refunded'
);


ALTER TYPE public.paymentstatus OWNER TO postgres;

--
-- Name: placementtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.placementtype AS ENUM (
    'banner',
    'featured_course',
    'sidebar',
    'inline',
    'popup'
);


ALTER TYPE public.placementtype OWNER TO postgres;

--
-- Name: popuptype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.popuptype AS ENUM (
    'info',
    'promotion',
    'announcement',
    'warning'
);


ALTER TYPE public.popuptype OWNER TO postgres;

--
-- Name: pricingmodel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pricingmodel AS ENUM (
    'fixed_daily',
    'per_impression',
    'per_click',
    'hybrid'
);


ALTER TYPE public.pricingmodel OWNER TO postgres;

--
-- Name: templatetype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.templatetype AS ENUM (
    'default',
    'premium',
    'modern',
    'elegant'
);


ALTER TYPE public.templatetype OWNER TO postgres;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.userrole AS ENUM (
    'admin',
    'staff',
    'organization',
    'teacher',
    'student'
);


ALTER TYPE public.userrole OWNER TO postgres;

--
-- Name: withdrawalstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.withdrawalstatus AS ENUM (
    'pending',
    'approved',
    'rejected',
    'paid'
);


ALTER TYPE public.withdrawalstatus OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_campaign_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_campaign_analytics (
    id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    date date NOT NULL,
    impressions integer NOT NULL,
    clicks integer NOT NULL,
    conversions integer NOT NULL,
    spent_amount numeric(10,2) NOT NULL,
    ctr numeric(5,2) NOT NULL,
    conversion_rate numeric(5,2) NOT NULL,
    cpc numeric(10,2) NOT NULL,
    cpm numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ad_campaign_analytics OWNER TO postgres;

--
-- Name: ad_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_campaigns (
    id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    course_id uuid NOT NULL,
    placement_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    status public.campaignstatus NOT NULL,
    campaign_type public.campaigntype NOT NULL,
    banner_image_url character varying(500),
    banner_link_url character varying(500),
    banner_alt_text character varying(255),
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    daily_budget numeric(10,2),
    total_budget numeric(10,2) NOT NULL,
    spent_amount numeric(10,2) NOT NULL,
    price_per_day numeric(10,2) NOT NULL,
    price_per_impression numeric(10,4),
    price_per_click numeric(10,2),
    pricing_model public.pricingmodel NOT NULL,
    target_categories jsonb,
    target_tags jsonb,
    is_targeted boolean NOT NULL,
    approval_status public.approvalstatus NOT NULL,
    approved_by_id uuid,
    approved_at timestamp without time zone,
    rejection_reason text,
    payment_status public.paymentstatus NOT NULL,
    payment_transaction_id character varying(255),
    impressions integer NOT NULL,
    clicks integer NOT NULL,
    conversions integer NOT NULL,
    ctr numeric(5,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_campaign_budget CHECK ((spent_amount <= total_budget)),
    CONSTRAINT check_campaign_date_range CHECK ((end_date > start_date)),
    CONSTRAINT check_campaign_total_budget_positive CHECK ((total_budget > (0)::numeric))
);


ALTER TABLE public.ad_campaigns OWNER TO postgres;

--
-- Name: ad_placements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_placements (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    placement_type public.placementtype NOT NULL,
    location character varying(100) NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    max_ads integer NOT NULL,
    is_active boolean NOT NULL,
    priority integer NOT NULL,
    targeting_options jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_placement_height_positive CHECK ((height > 0)),
    CONSTRAINT check_placement_max_ads_positive CHECK ((max_ads > 0)),
    CONSTRAINT check_placement_width_positive CHECK ((width > 0))
);


ALTER TABLE public.ad_placements OWNER TO postgres;

--
-- Name: ad_pricing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_pricing (
    id uuid NOT NULL,
    placement_id uuid NOT NULL,
    pricing_model public.pricingmodel NOT NULL,
    price_per_day numeric(10,2),
    price_per_impression numeric(10,4),
    price_per_click numeric(10,2),
    min_daily_budget numeric(10,2),
    max_daily_budget numeric(10,2),
    min_campaign_duration_days integer NOT NULL,
    max_campaign_duration_days integer,
    discount_percentage numeric(5,2) NOT NULL,
    is_active boolean NOT NULL,
    effective_from timestamp without time zone NOT NULL,
    effective_until timestamp without time zone,
    created_by_id uuid NOT NULL,
    updated_by_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_pricing_date_range CHECK (((effective_until IS NULL) OR (effective_until > effective_from))),
    CONSTRAINT check_pricing_discount_range CHECK (((discount_percentage >= (0)::numeric) AND (discount_percentage <= (100)::numeric))),
    CONSTRAINT check_pricing_max_duration_positive CHECK (((max_campaign_duration_days IS NULL) OR (max_campaign_duration_days > 0))),
    CONSTRAINT check_pricing_min_duration_positive CHECK ((min_campaign_duration_days > 0)),
    CONSTRAINT check_pricing_price_per_click_positive CHECK (((price_per_click IS NULL) OR (price_per_click > (0)::numeric))),
    CONSTRAINT check_pricing_price_per_day_positive CHECK (((price_per_day IS NULL) OR (price_per_day > (0)::numeric))),
    CONSTRAINT check_pricing_price_per_impression_positive CHECK (((price_per_impression IS NULL) OR (price_per_impression > (0)::numeric)))
);


ALTER TABLE public.ad_pricing OWNER TO postgres;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_categories (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    color character varying(7),
    parent_id uuid,
    "order" integer NOT NULL,
    is_active boolean NOT NULL,
    seo_meta_title character varying(255),
    seo_meta_description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blog_categories OWNER TO postgres;

--
-- Name: blog_post_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_post_categories (
    post_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE public.blog_post_categories OWNER TO postgres;

--
-- Name: blog_post_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_post_tags (
    post_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


ALTER TABLE public.blog_post_tags OWNER TO postgres;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    excerpt text,
    content text NOT NULL,
    featured_image_url character varying(500),
    author_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    published_at timestamp without time zone,
    view_count integer NOT NULL,
    is_featured boolean NOT NULL,
    is_pinned boolean NOT NULL,
    allow_comments boolean NOT NULL,
    seo_meta_title character varying(255),
    seo_meta_description text,
    seo_meta_keywords character varying(500),
    seo_og_title character varying(255),
    seo_og_description text,
    seo_og_image_url character varying(500),
    seo_twitter_card character varying(50),
    seo_canonical_url character varying(500),
    seo_schema_json json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_view_count_positive CHECK ((view_count >= 0))
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: blog_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_tags (
    id uuid NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    description text,
    usage_count integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blog_tags OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    price_at_add numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    color character varying(7),
    is_active boolean NOT NULL,
    parent_id uuid,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: certificate_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificate_templates (
    id uuid NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    template_type public.templatetype NOT NULL,
    background_image character varying(500),
    logo_image character varying(500),
    signature_image character varying(500),
    config json,
    created_by_id uuid NOT NULL,
    is_system_template boolean NOT NULL,
    is_active boolean NOT NULL,
    course_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.certificate_templates OWNER TO postgres;

--
-- Name: certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificates (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    certificate_number character varying(50) NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    completion_date timestamp with time zone NOT NULL,
    total_lessons integer NOT NULL,
    completed_lessons integer NOT NULL,
    completion_percentage integer NOT NULL,
    template_id uuid,
    pdf_path character varying(500),
    pdf_generated_at timestamp with time zone,
    qr_code_data text,
    is_revoked boolean NOT NULL,
    revoked_at timestamp with time zone,
    revoked_by_id uuid,
    revocation_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.certificates OWNER TO postgres;

--
-- Name: content_audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_audit_logs (
    id character varying(36) NOT NULL,
    user_id uuid,
    action character varying(50) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id character varying(36),
    metadata json,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.content_audit_logs OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id uuid NOT NULL,
    participant1_id uuid NOT NULL,
    participant2_id uuid NOT NULL,
    participant1_role character varying(20) NOT NULL,
    participant2_role character varying(20) NOT NULL,
    course_id uuid,
    subject character varying(255),
    conversation_type character varying(30) NOT NULL,
    last_message_at timestamp with time zone,
    last_message_preview text,
    last_read_at_participant1 timestamp with time zone,
    last_read_at_participant2 timestamp with time zone,
    unread_count_participant1 integer NOT NULL,
    unread_count_participant2 integer NOT NULL,
    is_archived_participant1 boolean NOT NULL,
    is_archived_participant2 boolean NOT NULL,
    is_closed boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_different_participants CHECK ((participant1_id <> participant2_id))
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: coupon_usages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_usages (
    id uuid NOT NULL,
    coupon_id uuid NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid,
    discount_amount numeric(10,2) NOT NULL,
    used_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.coupon_usages OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id uuid NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    coupon_type public.coupontype NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    max_discount numeric(10,2),
    trigger_type public.coupontriggertype NOT NULL,
    min_cart_value numeric(10,2),
    category_id uuid,
    usage_limit integer,
    usage_limit_per_user integer,
    used_count integer NOT NULL,
    valid_from timestamp without time zone NOT NULL,
    valid_until timestamp without time zone NOT NULL,
    is_active boolean NOT NULL,
    created_by_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_auto_apply boolean DEFAULT false NOT NULL,
    auto_apply_priority integer DEFAULT 0 NOT NULL,
    campaign_name character varying(255),
    campaign_description text,
    target_course_ids jsonb,
    CONSTRAINT check_auto_apply_priority_non_negative CHECK ((auto_apply_priority >= 0)),
    CONSTRAINT check_auto_apply_site_wide CHECK (((is_auto_apply = false) OR ((trigger_type)::text = 'site_wide'::text)))
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: course_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_categories (
    course_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE public.course_categories OWNER TO postgres;

--
-- Name: course_review_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_review_history (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    actor_id uuid,
    note text,
    changes_json text,
    ip_address character varying(45),
    user_agent character varying(500),
    is_system_generated boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    old_status character varying(50),
    new_status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    action_type character varying(50) DEFAULT 'submit_for_review'::character varying NOT NULL
);


ALTER TABLE public.course_review_history OWNER TO postgres;

--
-- Name: course_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_reviews (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    enrollment_id uuid,
    rating integer NOT NULL,
    title character varying(255),
    comment text,
    is_approved boolean DEFAULT false NOT NULL,
    is_helpful_count integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    approved_at timestamp without time zone,
    approved_by_admin_id uuid,
    moderation_note text,
    teacher_reply text,
    teacher_reply_at timestamp without time zone
);


ALTER TABLE public.course_reviews OWNER TO postgres;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    thumbnail_path character varying(500),
    price numeric(10,2) NOT NULL,
    discount_price numeric(10,2),
    is_featured boolean NOT NULL,
    meta_title character varying(255),
    meta_description text,
    teacher_id uuid NOT NULL,
    organization_id uuid,
    is_org_only boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    published_at timestamp without time zone,
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: crm_audience_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_audience_members (
    id uuid NOT NULL,
    audience_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.crm_audience_members OWNER TO postgres;

--
-- Name: crm_audiences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_audiences (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.crm_audiences OWNER TO postgres;

--
-- Name: crm_email_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_email_templates (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    html_body text NOT NULL,
    plain_body text,
    description text,
    variables_json json,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.crm_email_templates OWNER TO postgres;

--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_logs (
    id uuid NOT NULL,
    notification_id uuid,
    to_email character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    template_name character varying(100),
    status public.emailstatus NOT NULL,
    attempt_count integer NOT NULL,
    last_error text,
    sent_at timestamp without time zone,
    payload json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_logs OWNER TO postgres;

--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    order_id uuid,
    progress_percentage integer NOT NULL,
    last_accessed_at timestamp without time zone,
    completed_at timestamp without time zone,
    enrolled_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_progress (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    watched_seconds integer NOT NULL,
    is_completed boolean NOT NULL,
    completed_at timestamp without time zone,
    first_accessed_at timestamp without time zone DEFAULT now() NOT NULL,
    last_accessed_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lesson_progress OWNER TO postgres;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    lesson_type public.lessontype NOT NULL,
    content_path character varying(500),
    video_url character varying(500),
    duration_seconds integer,
    "order" integer NOT NULL,
    is_preview boolean NOT NULL,
    course_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    content_text text,
    original_filename character varying(500),
    file_size_bytes integer,
    mime_type character varying(100),
    thumbnail_path character varying(500),
    live_lesson_url character varying(500),
    live_lesson_at timestamp with time zone,
    live_lesson_recording_path character varying(500),
    is_live_lesson_ended boolean DEFAULT false NOT NULL,
    CONSTRAINT ck_lessons_file_size_bytes_non_negative CHECK (((file_size_bytes IS NULL) OR (file_size_bytes >= 0)))
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- Name: message_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message_reports (
    id uuid NOT NULL,
    message_id uuid NOT NULL,
    reporter_id uuid NOT NULL,
    reason character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.message_reports OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    sender_role character varying(20) NOT NULL,
    content text NOT NULL,
    attachment_url character varying(500),
    attachment_filename character varying(255),
    attachment_size bigint,
    is_read boolean NOT NULL,
    read_at timestamp with time zone,
    is_deleted boolean NOT NULL,
    deleted_at timestamp with time zone,
    is_flagged boolean NOT NULL,
    flag_reason character varying(255),
    moderated_at timestamp with time zone,
    moderated_by_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_preferences (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    preferences json,
    email_enabled boolean DEFAULT true NOT NULL,
    push_enabled boolean DEFAULT true NOT NULL,
    in_app_enabled boolean DEFAULT true NOT NULL,
    quiet_hours_start character varying(5),
    quiet_hours_end character varying(5),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification_preferences OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    sender_id uuid,
    notification_type public.notificationtype NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data json,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp without time zone,
    delivery_channels json,
    priority public.notificationpriority DEFAULT 'medium'::public.notificationpriority NOT NULL,
    expires_at timestamp without time zone,
    action_url character varying(500),
    action_label character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    course_id uuid NOT NULL,
    price numeric(10,2) NOT NULL,
    discount_price numeric(10,2),
    final_price numeric(10,2) NOT NULL,
    platform_commission_rate numeric(5,2) NOT NULL,
    platform_commission numeric(10,2) NOT NULL,
    teacher_earnings numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    status public.orderstatus NOT NULL,
    payment_method public.paymentmethod,
    payment_gateway_transaction_id character varying(255),
    payment_gateway_response text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    paid_at timestamp without time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: popup_announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.popup_announcements (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    popup_type public.popuptype NOT NULL,
    is_active boolean NOT NULL,
    starts_at timestamp without time zone,
    expires_at timestamp without time zone,
    target_audience character varying(50) NOT NULL,
    priority integer NOT NULL,
    is_dismissible boolean NOT NULL,
    show_once_per_user boolean NOT NULL,
    dismiss_duration_days integer,
    image_url character varying(500),
    button_text character varying(100),
    button_link_url character varying(500),
    button_link_target character varying(20) NOT NULL,
    width integer NOT NULL,
    height integer,
    "position" character varying(20) NOT NULL,
    overlay_opacity numeric(3,2) NOT NULL,
    created_by_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_popup_date_range CHECK (((expires_at IS NULL) OR (starts_at IS NULL) OR (expires_at > starts_at))),
    CONSTRAINT check_popup_height_positive CHECK (((height IS NULL) OR (height > 0))),
    CONSTRAINT check_popup_overlay_opacity_range CHECK (((overlay_opacity >= (0)::numeric) AND (overlay_opacity <= (1)::numeric))),
    CONSTRAINT check_popup_width_positive CHECK ((width > 0))
);


ALTER TABLE public.popup_announcements OWNER TO postgres;

--
-- Name: quiz_attempt_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_attempt_answers (
    id uuid NOT NULL,
    attempt_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer_text text NOT NULL,
    is_correct boolean NOT NULL,
    points_earned integer NOT NULL,
    answered_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quiz_attempt_answers OWNER TO postgres;

--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_attempts (
    id uuid NOT NULL,
    quiz_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status character varying(50) NOT NULL,
    total_questions integer NOT NULL,
    correct_answers integer NOT NULL,
    score_percentage integer NOT NULL,
    points_earned integer NOT NULL,
    total_points integer NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    time_taken_seconds integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quiz_attempts OWNER TO postgres;

--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_questions (
    id uuid NOT NULL,
    quiz_id uuid NOT NULL,
    question_type character varying(50) NOT NULL,
    question_text text NOT NULL,
    options json,
    correct_answer character varying(255) NOT NULL,
    points integer NOT NULL,
    "order" integer NOT NULL,
    explanation text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quiz_questions OWNER TO postgres;

--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quizzes (
    id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    passing_score integer NOT NULL,
    time_limit_minutes integer,
    max_attempts integer,
    shuffle_questions boolean NOT NULL,
    show_correct_answers boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quizzes OWNER TO postgres;

--
-- Name: site_announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_announcements (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type public.announcementtype NOT NULL,
    is_active boolean NOT NULL,
    starts_at timestamp without time zone,
    expires_at timestamp without time zone,
    target_audience character varying(50),
    priority integer NOT NULL,
    is_dismissible boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.site_announcements OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    general json,
    smtp json,
    seo json,
    custom_code json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    platform json
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_id_seq OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: storage_quotas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storage_quotas (
    id character varying(36) NOT NULL,
    user_id uuid NOT NULL,
    quota_bytes bigint NOT NULL,
    used_bytes bigint NOT NULL,
    reset_at timestamp with time zone,
    reset_period_days integer,
    is_custom boolean DEFAULT false NOT NULL,
    notes character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.storage_quotas OWNER TO postgres;

--
-- Name: teacher_bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_bank_accounts (
    id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    bank_name character varying(100) NOT NULL,
    iban character varying(34) NOT NULL,
    account_holder_name character varying(150) NOT NULL,
    is_default boolean NOT NULL,
    status public.bankaccountstatus NOT NULL,
    review_note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    approved_at timestamp without time zone,
    rejected_at timestamp without time zone
);


ALTER TABLE public.teacher_bank_accounts OWNER TO postgres;

--
-- Name: teacher_earnings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_earnings (
    id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    course_id uuid,
    order_id uuid,
    withdrawal_request_id uuid,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) NOT NULL,
    gross_amount numeric(10,2),
    commission_rate numeric(5,2),
    commission_amount numeric(10,2),
    type public.earningtype NOT NULL,
    description text,
    reference_id character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    ad_campaign_id uuid
);


ALTER TABLE public.teacher_earnings OWNER TO postgres;

--
-- Name: user_blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_blocks (
    id uuid NOT NULL,
    blocker_id uuid NOT NULL,
    blocked_id uuid NOT NULL,
    reason character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_block_different_users CHECK ((blocker_id <> blocked_id))
);


ALTER TABLE public.user_blocks OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role public.userrole NOT NULL,
    is_active boolean NOT NULL,
    is_verified boolean NOT NULL,
    organization_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    phone character varying(20),
    last_login_at timestamp without time zone,
    bio text,
    expertise_tags json,
    social_links json,
    avatar_url character varying(500)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: withdrawal_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.withdrawal_requests (
    id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    bank_account_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) NOT NULL,
    status public.withdrawalstatus NOT NULL,
    admin_note text,
    requested_at timestamp without time zone DEFAULT now() NOT NULL,
    processed_at timestamp without time zone,
    paid_at timestamp without time zone
);


ALTER TABLE public.withdrawal_requests OWNER TO postgres;

--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Data for Name: ad_campaign_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_campaign_analytics (id, campaign_id, date, impressions, clicks, conversions, spent_amount, ctr, conversion_rate, cpc, cpm, created_at, updated_at) FROM stdin;
643f7e4f-3b2b-43e0-b924-d0746ed83d6c	f94a5a47-bd36-4899-ba88-cec6708d9cb4	2026-02-19	2	0	0	0.00	0.00	0.00	0.00	0.00	2026-02-19 14:54:01.761818	2026-02-19 20:05:19.13701
2b2f423d-186b-4006-a2a5-fa301d7dfa07	25c25a02-3123-44f0-9c94-7af02dc6bcff	2026-02-19	10	1	0	0.00	0.00	0.00	0.00	0.00	2026-02-19 14:14:31.163751	2026-02-19 20:05:23.348047
1c31839d-e3e6-4490-914a-4d929811a6e1	4222c22d-6c69-432c-b2ce-57d3f84f66e9	2026-02-19	3	1	0	0.00	0.00	0.00	0.00	0.00	2026-02-19 14:14:57.700408	2026-02-19 20:05:25.485115
7c243e49-a4b4-4683-95ad-a4f44aa55cec	d4299b40-f8e0-41b3-871d-8ac0b521318e	2026-02-19	23	4	0	0.00	0.00	0.00	0.00	0.00	2026-02-19 13:53:38.873234	2026-02-19 21:53:08.56918
\.


--
-- Data for Name: ad_campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_campaigns (id, teacher_id, course_id, placement_id, name, status, campaign_type, banner_image_url, banner_link_url, banner_alt_text, start_date, end_date, daily_budget, total_budget, spent_amount, price_per_day, price_per_impression, price_per_click, pricing_model, target_categories, target_tags, is_targeted, approval_status, approved_by_id, approved_at, rejection_reason, payment_status, payment_transaction_id, impressions, clicks, conversions, ctr, created_at, updated_at) FROM stdin;
28a994bf-d5ea-4a82-a792-bb4bdc8fff90	9bb65634-56d3-489b-b405-a5948deec543	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	c0074149-d757-4a5c-a0bb-7cd4ca74b7c8	TEST2	completed	featured_course	\N	\N	\N	2026-02-19 14:13:00	2026-02-20 14:12:00	\N	100.00	0.00	100.00	\N	\N	fixed_daily	[]	[]	f	approved	1dc668fb-5653-44b6-bc99-ba0df7820504	2026-02-19 14:13:08.39042	\N	paid	\N	0	0	0	0.00	2026-02-19 14:12:07.633379	2026-02-22 23:06:37.964452
4222c22d-6c69-432c-b2ce-57d3f84f66e9	9bb65634-56d3-489b-b405-a5948deec543	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	e38c750f-01a0-4b82-9227-e903b25c67da	TEST2	completed	featured_course	\N	\N	\N	2026-02-19 14:13:00	2026-02-20 14:13:00	\N	120.00	0.00	60.00	\N	\N	fixed_daily	[]	[]	f	approved	1dc668fb-5653-44b6-bc99-ba0df7820504	2026-02-19 14:13:07.73239	\N	paid	\N	3	1	0	33.33	2026-02-19 14:12:32.542413	2026-02-22 23:06:37.964452
d4299b40-f8e0-41b3-871d-8ac0b521318e	9bb65634-56d3-489b-b405-a5948deec543	def3437c-27ee-4775-a2a4-a40bfec1012a	20977911-c9fa-4a3f-99dc-cd5fd8083097	Test	completed	featured_course	\N	\N	\N	2026-02-19 13:38:00	2026-02-21 13:29:00	\N	300.00	0.00	150.00	\N	\N	fixed_daily	[]	[]	f	approved	1dc668fb-5653-44b6-bc99-ba0df7820504	2026-02-19 13:49:45.199757	\N	paid	\N	23	4	0	17.39	2026-02-19 13:37:16.562786	2026-02-22 23:06:37.964452
f94a5a47-bd36-4899-ba88-cec6708d9cb4	9bb65634-56d3-489b-b405-a5948deec543	c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7	2b4662fa-8d9d-488b-b61a-de9f56a639a9	Uazay	completed	featured_course	\N	\N	\N	2026-02-19 14:43:00	2026-02-20 14:42:00	\N	80.00	0.00	80.00	\N	\N	fixed_daily	[]	[]	f	approved	1dc668fb-5653-44b6-bc99-ba0df7820504	2026-02-19 14:42:41.9279	\N	paid	\N	2	0	0	0.00	2026-02-19 14:42:30.840903	2026-02-22 23:06:37.964452
25c25a02-3123-44f0-9c94-7af02dc6bcff	9bb65634-56d3-489b-b405-a5948deec543	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	cb763a0d-1cb6-4c9d-ad4f-8fb9fbf3966d	TEST	completed	featured_course	\N	\N	\N	2026-02-19 14:13:00	2026-02-20 14:12:00	\N	50.00	0.00	50.00	\N	\N	fixed_daily	[]	[]	f	approved	1dc668fb-5653-44b6-bc99-ba0df7820504	2026-02-19 14:13:06.847144	\N	paid	\N	10	1	0	10.00	2026-02-19 14:12:58.859372	2026-02-22 23:06:37.964452
\.


--
-- Data for Name: ad_placements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_placements (id, name, code, description, placement_type, location, width, height, max_ads, is_active, priority, targeting_options, created_at, updated_at) FROM stdin;
20977911-c9fa-4a3f-99dc-cd5fd8083097	Ana Sayfa Banner	homepage_banner	Ana sayfada features section'dan sonra görünen banner reklam alanı	banner	homepage	1200	300	1	t	100	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
c0074149-d757-4a5c-a0bb-7cd4ca74b7c8	Kategori Sayfası Banner	category_banner	Kategori sayfasında üstte görünen banner reklam alanı	banner	category_page	1200	200	1	t	90	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
cb763a0d-1cb6-4c9d-ad4f-8fb9fbf3966d	Kurslar Sayfası Sidebar	sidebar_courses	Kurslar sayfasında sidebar'da görünen reklam alanı	sidebar	courses_page	300	250	2	t	80	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
2b4662fa-8d9d-488b-b61a-de9f56a639a9	Kurslar Sayfası Inline	inline_courses	Kurslar sayfasında kurslar arasında görünen inline reklam alanı	inline	courses_page	1200	150	1	t	70	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
e38c750f-01a0-4b82-9227-e903b25c67da	Kurs Detay Sidebar	sidebar_course_detail	Kurs detay sayfasında sidebar'da görünen reklam alanı	sidebar	course_detail_page	300	250	2	t	85	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
33239aba-97d7-4c5f-b7d8-4aba2d644225	Öne Çıkan Kurslar	featured_courses_homepage	Ana sayfada öne çıkan kurslar bölümü	featured_course	homepage	1200	1	6	t	95	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
\.


--
-- Data for Name: ad_pricing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_pricing (id, placement_id, pricing_model, price_per_day, price_per_impression, price_per_click, min_daily_budget, max_daily_budget, min_campaign_duration_days, max_campaign_duration_days, discount_percentage, is_active, effective_from, effective_until, created_by_id, updated_by_id, created_at, updated_at) FROM stdin;
c20bd63d-99ec-4942-8343-f31960d0199b	20977911-c9fa-4a3f-99dc-cd5fd8083097	fixed_daily	150.00	\N	\N	75.00	750.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
92e1335f-bd9f-4a55-918f-476151e69c42	20977911-c9fa-4a3f-99dc-cd5fd8083097	per_impression	\N	0.0500	\N	10.00	1000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
cdeabe64-106c-45b5-a536-85f13c8de555	20977911-c9fa-4a3f-99dc-cd5fd8083097	per_click	\N	\N	2.00	20.00	2000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
c4ad03ee-b4be-4a41-95e0-864c31afd6c8	c0074149-d757-4a5c-a0bb-7cd4ca74b7c8	fixed_daily	100.00	\N	\N	50.00	500.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
82ec3524-8dc0-4101-80b0-5514a5fbd12a	c0074149-d757-4a5c-a0bb-7cd4ca74b7c8	per_impression	\N	0.0300	\N	10.00	1000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
f0ce0bb8-1ba7-4b68-8a07-2ee2efd1c381	c0074149-d757-4a5c-a0bb-7cd4ca74b7c8	per_click	\N	\N	1.50	20.00	2000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
5817c713-d9ee-4761-a1c1-6149251301be	cb763a0d-1cb6-4c9d-ad4f-8fb9fbf3966d	fixed_daily	50.00	\N	\N	25.00	250.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
30b65b91-9fe0-482b-9aaf-5480fe0414df	cb763a0d-1cb6-4c9d-ad4f-8fb9fbf3966d	per_impression	\N	0.0200	\N	10.00	1000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
ca89b166-5d08-4324-b86d-fa43b3769b23	cb763a0d-1cb6-4c9d-ad4f-8fb9fbf3966d	per_click	\N	\N	1.00	20.00	2000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
981f3d23-4762-497e-8ef8-93dd6922d94c	2b4662fa-8d9d-488b-b61a-de9f56a639a9	fixed_daily	80.00	\N	\N	40.00	400.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
61c4cde0-ca67-4c98-98c9-eca33e8179f7	2b4662fa-8d9d-488b-b61a-de9f56a639a9	per_impression	\N	0.0250	\N	10.00	1000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
a76a1ee7-6ab2-4872-9604-0463d345e76a	2b4662fa-8d9d-488b-b61a-de9f56a639a9	per_click	\N	\N	1.25	20.00	2000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
48367ea1-6d66-42ab-ad21-02f8a82eab58	e38c750f-01a0-4b82-9227-e903b25c67da	fixed_daily	60.00	\N	\N	30.00	300.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
e916e3d5-ccf8-43e6-90b9-19dd33ae5a73	e38c750f-01a0-4b82-9227-e903b25c67da	per_impression	\N	0.0220	\N	10.00	1000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
14bb51b3-a96d-4853-ba2e-59781cfb7994	e38c750f-01a0-4b82-9227-e903b25c67da	per_click	\N	\N	1.10	20.00	2000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
96814665-dff7-484a-8728-9501c5dca19b	33239aba-97d7-4c5f-b7d8-4aba2d644225	fixed_daily	200.00	\N	\N	100.00	1000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
4d27ddb0-e2d6-467b-81ab-f4384b8cd6ee	33239aba-97d7-4c5f-b7d8-4aba2d644225	per_impression	\N	0.0800	\N	10.00	1000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
9d04218b-aa91-40ca-bfae-0c5f86df2c10	33239aba-97d7-4c5f-b7d8-4aba2d644225	per_click	\N	\N	3.00	20.00	2000.00	1	90	0.00	t	2026-02-19 12:16:23.25867	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	2026-02-19 12:16:23.31538	2026-02-19 12:16:23.31538
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
20260223_site_wide_coupons
\.


--
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_categories (id, name, slug, description, icon, color, parent_id, "order", is_active, seo_meta_title, seo_meta_description, created_at, updated_at) FROM stdin;
20d3eb8e-f3ce-4557-96a1-c95b1c01a298	Test	test	Test		#10b981	\N	0	t	\N	\N	2026-02-19 17:21:46.764671	2026-02-19 17:21:46.764671
\.


--
-- Data for Name: blog_post_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_post_categories (post_id, category_id) FROM stdin;
2763ff05-12d0-4e8c-a213-d73506bc9dcb	20d3eb8e-f3ce-4557-96a1-c95b1c01a298
1eb10287-fe40-4734-becc-e7a4ec1fc80c	20d3eb8e-f3ce-4557-96a1-c95b1c01a298
bbc7409f-5601-4b18-bb34-d05def700206	20d3eb8e-f3ce-4557-96a1-c95b1c01a298
\.


--
-- Data for Name: blog_post_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_post_tags (post_id, tag_id) FROM stdin;
2763ff05-12d0-4e8c-a213-d73506bc9dcb	ed8ce9b3-ee1c-4d76-bd06-ab8d1d1c20ed
1eb10287-fe40-4734-becc-e7a4ec1fc80c	ed8ce9b3-ee1c-4d76-bd06-ab8d1d1c20ed
bbc7409f-5601-4b18-bb34-d05def700206	ed8ce9b3-ee1c-4d76-bd06-ab8d1d1c20ed
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_posts (id, title, slug, excerpt, content, featured_image_url, author_id, status, published_at, view_count, is_featured, is_pinned, allow_comments, seo_meta_title, seo_meta_description, seo_meta_keywords, seo_og_title, seo_og_description, seo_og_image_url, seo_twitter_card, seo_canonical_url, seo_schema_json, created_at, updated_at) FROM stdin;
2763ff05-12d0-4e8c-a213-d73506bc9dcb	Test	test	Test 	<h1>H1 TEST</h1><h2>H2 Test</h2><h3>H3 Test</h3><div><br></div><div><ul><li>Da</li><li><span style="font-family: var(--font-body);">DA</span></li></ul><blockquote><ol><li>13</li></ol></blockquote></div>	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	published	2026-02-19 17:22:22.801991	1	f	f	t	T	T	\N	\N	\N	\N	summary_large_image	\N	null	2026-02-19 17:21:55.659598	2026-02-19 17:23:36.931757
1eb10287-fe40-4734-becc-e7a4ec1fc80c	Eğitmen Blog	egitmen-test-blog	eGİTMEN Test Blog	<h1><br></h1><div><h1>H1 Eğitmen Test</h1></div><div><h1>H1 Eğitmen Test</h1></div><div><h1>H1 Eğitmen Test</h1></div><div><h1>H1 Eğitmen Test</h1></div><div><h1>H1 Eğitmen Test</h1></div><div><h1>H1 Eğitmen Test</h1></div><div><h1>H1 Eğitmen Test</h1></div><div><h1>H1 Eğitmen Test</h1></div>	\N	9bb65634-56d3-489b-b405-a5948deec543	published	2026-02-19 17:24:26.948749	0	f	f	t	O	e	\N	\N	\N	\N	summary_large_image	\N	null	2026-02-19 17:24:20.21407	2026-02-19 17:24:26.942318
bbc7409f-5601-4b18-bb34-d05def700206	Eğitmen Blog 2	egitmen-blog2	Eğitmen Blog 2	&nbsp;Eğitmen Blog 2&nbsp;Eğitmen Blog 2&nbsp;Eğitmen Blog 2Eğitmen Blog 2&nbsp;Eğitmen Blog 2&nbsp;Eğitmen Blog 2Eğitmen Blog 2&nbsp;Eğitmen Blog 2&nbsp;Eğitmen Blog 2Eğitmen Blog 2&nbsp;Eğitmen Blog 2&nbsp;Eğitmen Blog 2	\N	9bb65634-56d3-489b-b405-a5948deec543	published	2026-02-19 18:57:54.019918	0	f	f	t	E	Eğitmen Blog 2	\N	\N	\N	\N	summary_large_image	\N	null	2026-02-19 18:50:09.862079	2026-02-19 18:57:54.009797
\.


--
-- Data for Name: blog_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_tags (id, name, slug, description, usage_count, created_at, updated_at) FROM stdin;
ed8ce9b3-ee1c-4d76-bd06-ab8d1d1c20ed	tEST	test		3	2026-02-19 17:22:07.73993	2026-02-19 18:50:09.862079
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, user_id, course_id, price_at_add, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, icon, color, is_active, parent_id, "order", created_at, updated_at) FROM stdin;
de850a25-38b4-445a-a05b-928ffd5611e3	Genel	genel	\N	🏷️	#0d9488	t	\N	0	2026-02-05 09:38:26.828505	2026-02-05 09:38:26.828505
b80f4fc9-69e6-41e8-b1d6-b939f976e48a	YKS	yks	Sınav odaklı dersler için üst kategori	🎯	#0f766e	t	\N	0	2026-02-05 09:48:38.057498	2026-02-05 09:48:38.057498
27b83414-6b07-42a0-bc15-c552314709d1	Fizik	fizik	\N	🏷️	#0d9488	t	b80f4fc9-69e6-41e8-b1d6-b939f976e48a	0	2026-02-05 09:38:26.828505	2026-02-05 09:48:38.057498
7ce05a0d-c2e1-4937-b371-dd552ddbf1ae	Matematik	matematik	\N	🏷️	#0d9488	t	b80f4fc9-69e6-41e8-b1d6-b939f976e48a	0	2026-02-05 09:38:26.828505	2026-02-05 09:48:38.057498
8bf772e5-9544-4c83-a709-6a1e1533c5d0	Coğrafya	cografya	\N	🏷️	#0d9488	t	b80f4fc9-69e6-41e8-b1d6-b939f976e48a	0	2026-02-05 09:38:26.828505	2026-02-05 09:48:38.057498
8f3a92be-b48d-47b4-9b57-b645756b2562	Tarih	tarih	\N	🏷️	#0d9488	t	b80f4fc9-69e6-41e8-b1d6-b939f976e48a	0	2026-02-05 09:38:26.828505	2026-02-05 09:48:38.057498
c17958bd-33f4-4e3f-b0a9-218a829d2ffb	Türkçe	turkce	\N	🏷️	#0d9488	t	b80f4fc9-69e6-41e8-b1d6-b939f976e48a	0	2026-02-05 09:38:26.828505	2026-02-05 09:48:38.057498
cf1880a0-dba0-464f-b2e6-32c695de0a8e	Kimya	kimya	\N	🏷️	#0d9488	t	b80f4fc9-69e6-41e8-b1d6-b939f976e48a	0	2026-02-05 09:38:26.828505	2026-02-05 09:48:38.057498
ed14f17f-877f-4c13-af77-5357d21e81ab	Biyoloji	biyoloji	\N	🏷️	#0d9488	t	b80f4fc9-69e6-41e8-b1d6-b939f976e48a	0	2026-02-05 09:38:26.828505	2026-02-05 09:48:38.057498
\.


--
-- Data for Name: certificate_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificate_templates (id, name, description, template_type, background_image, logo_image, signature_image, config, created_by_id, is_system_template, is_active, course_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificates (id, user_id, course_id, enrollment_id, certificate_number, issued_at, completion_date, total_lessons, completed_lessons, completion_percentage, template_id, pdf_path, pdf_generated_at, qr_code_data, is_revoked, revoked_at, revoked_by_id, revocation_reason, created_at, updated_at) FROM stdin;
77060184-12e1-4f00-bd5e-c33a06c3b362	51af4383-2b88-4de0-a073-4964625dbda1	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	df494fc7-05b5-4f2d-9a35-c31562d5c827	CERT-2026-000001	2026-02-11 09:41:35.082543+00	2026-02-11 06:39:24.864983+00	5	5	100	\N	certificates/CERT-2026-000001.html	2026-02-11 09:51:05.774589+00	https://yourdomain.com/verify-certificate/77060184-12e1-4f00-bd5e-c33a06c3b362	f	\N	\N	\N	2026-02-11 09:41:35.082543	2026-02-11 09:51:05.725465
\.


--
-- Data for Name: content_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_audit_logs (id, user_id, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, participant1_id, participant2_id, participant1_role, participant2_role, course_id, subject, conversation_type, last_message_at, last_message_preview, last_read_at_participant1, last_read_at_participant2, unread_count_participant1, unread_count_participant2, is_archived_participant1, is_archived_participant2, is_closed, created_at, updated_at) FROM stdin;
66e24f7b-cfbb-46f5-a085-3a8b085103dc	1dc668fb-5653-44b6-bc99-ba0df7820504	9bb65634-56d3-489b-b405-a5948deec543	admin	teacher	\N	\N	admin_teacher	2026-02-22 23:30:35.354329+00	Test	2026-02-26 12:08:50.111498+00	2026-02-23 03:02:05.611529+00	0	0	f	f	f	2026-02-22 23:26:54.773031+00	2026-02-26 12:08:50.107865+00
\.


--
-- Data for Name: coupon_usages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_usages (id, coupon_id, user_id, order_id, discount_amount, used_at) FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, description, coupon_type, discount_value, max_discount, trigger_type, min_cart_value, category_id, usage_limit, usage_limit_per_user, used_count, valid_from, valid_until, is_active, created_by_id, created_at, updated_at, is_auto_apply, auto_apply_priority, campaign_name, campaign_description, target_course_ids) FROM stdin;
973f9a26-e6ae-40c1-b628-add88b4b4e87	TESTKUPON		percentage	15.00	\N	manual	\N	\N	\N	1	0	2026-02-06 00:00:00	2026-02-15 00:00:00	t	1dc668fb-5653-44b6-bc99-ba0df7820504	2026-02-06 20:38:58.072517	2026-02-06 20:42:19.048658	f	0	\N	\N	\N
\.


--
-- Data for Name: course_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_categories (course_id, category_id) FROM stdin;
bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	27b83414-6b07-42a0-bc15-c552314709d1
1809aa06-2c64-4cb9-93a8-ce8f0268c744	8bf772e5-9544-4c83-a709-6a1e1533c5d0
34d57788-3c4b-442f-9fc8-76873ac7cc13	de850a25-38b4-445a-a05b-928ffd5611e3
810eba37-85e7-42a3-b854-ebe7a5ec9aaa	c17958bd-33f4-4e3f-b0a9-218a829d2ffb
eeb69cbd-d481-434e-b487-b628fea37c96	8f3a92be-b48d-47b4-9b57-b645756b2562
34f3f43d-25db-42d6-ab5e-322ce806168d	cf1880a0-dba0-464f-b2e6-32c695de0a8e
e6f02d9f-ffdf-4fda-b646-fb6958ac5280	7ce05a0d-c2e1-4937-b371-dd552ddbf1ae
2eaec894-3a39-46a7-add2-cb090b5b18a7	ed14f17f-877f-4c13-af77-5357d21e81ab
def3437c-27ee-4775-a2a4-a40bfec1012a	de850a25-38b4-445a-a05b-928ffd5611e3
def3437c-27ee-4775-a2a4-a40bfec1012a	b80f4fc9-69e6-41e8-b1d6-b939f976e48a
c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7	de850a25-38b4-445a-a05b-928ffd5611e3
20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	de850a25-38b4-445a-a05b-928ffd5611e3
\.


--
-- Data for Name: course_review_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_review_history (id, course_id, actor_id, note, changes_json, ip_address, user_agent, is_system_generated, created_at, old_status, new_status, action_type) FROM stdin;
01d72666-4b16-4896-8f5f-e8590a9a1b25	def3437c-27ee-4775-a2a4-a40bfec1012a	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	\N	f	2026-02-05 20:50:45.313338	draft	pending_review	submit_for_review
b804d0b1-7635-402b-99c4-0a1234986e5d	def3437c-27ee-4775-a2a4-a40bfec1012a	1dc668fb-5653-44b6-bc99-ba0df7820504	Admin tarafından düzenlendi: categories	{"categories": {"old": ["de850a25-38b4-445a-a05b-928ffd5611e3"], "new": ["de850a25-38b4-445a-a05b-928ffd5611e3", "b80f4fc9-69e6-41e8-b1d6-b939f976e48a"]}}	\N	\N	f	2026-02-05 20:54:12.153675	pending_review	pending_review	edit
edb0eb86-65c1-4ad6-8a9a-dd9888fbc1fd	def3437c-27ee-4775-a2a4-a40bfec1012a	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	\N	\N	\N	f	2026-02-05 20:54:17.364064	pending_review	published	approve
719826dc-0a90-4136-99af-a1b2c8f118cd	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	\N	f	2026-02-06 02:13:09.314947	draft	pending_review	submit_for_review
927341a3-7599-4965-84aa-310f4a4d2855	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	\N	\N	\N	f	2026-02-06 02:13:29.133404	pending_review	published	approve
7f00bc4c-24c4-4c9c-840a-8d62b8d68451	c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	\N	f	2026-02-11 11:09:43.532712	draft	pending_review	submit_for_review
be7dadb1-86c0-4d41-8b72-89769d33917a	c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	\N	\N	\N	f	2026-02-11 11:10:28.723741	pending_review	published	approve
\.


--
-- Data for Name: course_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_reviews (id, user_id, course_id, enrollment_id, rating, title, comment, is_approved, is_helpful_count, created_at, updated_at, approved_at, approved_by_admin_id, moderation_note, teacher_reply, teacher_reply_at) FROM stdin;
dbaf8d4c-a662-4d59-8ed0-91a277a902a6	54157c4d-9992-44aa-9a47-9bac2e5fbd88	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	3f1a22a8-fc2b-4cc2-9c31-9071b105da43	4	İyi bir kurs	Güzel anlatılmış, biraz daha örnek olsa daha iyi olurdu.	t	0	2026-01-23 14:51:01.816006	2026-01-23 14:51:01.816006	\N	\N	\N	\N	\N
ab479ecc-0808-4d32-b363-e60cd3f4d3c7	51af4383-2b88-4de0-a073-4964625dbda1	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	0d0a9d62-e772-43dc-915c-bd5e7de85e4f	5	Harika bir kurs!	Çok faydalı ve açıklayıcı. Kesinlikle tavsiye ederim.	t	0	2026-01-23 14:51:01.816006	2026-02-07 13:36:31.479204	\N	\N	\N	Rica ederim ne demek :) 	2026-02-07 13:36:31.499294
43ffe307-f00d-49e0-ae00-9e4b56cb3497	51af4383-2b88-4de0-a073-4964625dbda1	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	df494fc7-05b5-4f2d-9a35-c31562d5c827	4	Süper bir kurs bu!	Süper bir kurs bu!	t	0	2026-02-11 11:04:40.788942	2026-02-11 11:10:44.139405	2026-02-11 11:10:44.145369	1dc668fb-5653-44b6-bc99-ba0df7820504	\N	\N	\N
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, title, slug, description, thumbnail_path, price, discount_price, is_featured, meta_title, meta_description, teacher_id, organization_id, is_org_only, created_at, updated_at, published_at, status) FROM stdin;
b16dfb25-e6b5-449f-aa44-8250a74389e4	Bu bir test kursudur	bu-bir-test-kursudur	Bu bir test kursudur	\N	15.00	\N	f	\N	\N	66e151fd-134f-4cfd-a4d9-0098b6af6001	\N	f	2026-01-23 09:33:27.01148	2026-01-23 09:33:27.01148	\N	draft
b308539b-b3a7-4794-8b47-0058788adabd	Test	test-kursu	Bu kurs bir test kursudur. 	\N	15.00	\N	f	\N	\N	66e151fd-134f-4cfd-a4d9-0098b6af6001	\N	f	2026-01-23 09:29:20.517296	2026-01-23 09:29:20.517296	\N	draft
bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	Fizik - Mekanik	fizik-mekanik	Fizik mekanik konularını detaylı bir şekilde öğrenin. Hareket, kuvvet, enerji ve momentum konularını kapsar.	\N	399.00	\N	t	\N	\N	0e096750-b455-4cb8-b887-4ebc66fde107	\N	f	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	2026-01-21 04:16:28.420724	published
e6f02d9f-ffdf-4fda-b646-fb6958ac5280	Matematik - Temel Seviye	matematik-temel-seviye	Matematik temel konularını öğrenin. Toplama, çıkarma, çarpma ve bölme işlemlerinden başlayarak matematik dünyasına adım atın.	\N	299.00	199.00	t	\N	\N	9bb65634-56d3-489b-b405-a5948deec543	\N	f	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	2026-01-22 04:16:28.41063	published
eeb69cbd-d481-434e-b487-b628fea37c96	Tarih - Osmanlı Tarihi	tarih-osmanli-tarihi	Osmanlı İmparatorluğu tarihini öğrenin. Kuruluş, yükseliş ve çöküş dönemlerini detaylı bir şekilde işleyin.	\N	279.00	199.00	f	\N	\N	89ef4d93-9840-4400-85b8-5583d1739982	\N	f	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	2026-01-16 04:16:28.435025	published
c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7	Uzay Hocam	uzay-hocam2	Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test 	\N	50.00	\N	f	\N	\N	9bb65634-56d3-489b-b405-a5948deec543	\N	f	2026-01-30 13:26:57.568477	2026-02-11 11:10:28.723741	2026-02-11 11:10:28.729279	published
def3437c-27ee-4775-a2a4-a40bfec1012a	Test Kursu	test-kursu-v3	Test Kursu Test Kursu Test Kursu Test Kursu Test Kursu Test Kursu Test Kursu 	\N	55.00	\N	f	\N	\N	9bb65634-56d3-489b-b405-a5948deec543	\N	f	2026-02-05 20:18:08.367167	2026-02-05 20:54:17.364064	2026-02-05 20:54:17.374399	published
20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	Ücretsiz Kurs	ucretsiz-kurs	Ücretsiz Kurs Ücretsiz Kurs Ücretsiz Kurs Ucretsiz Ders Ucretsiz Ders Ucretsiz Ders	\N	0.00	\N	f	\N	\N	9bb65634-56d3-489b-b405-a5948deec543	\N	f	2026-02-06 02:12:25.604429	2026-02-06 02:13:29.133404	2026-02-06 02:13:29.13792	published
1809aa06-2c64-4cb9-93a8-ce8f0268c744	Coğrafya - Türkiye Coğrafyası	cografya-turkiye-cografyasi	Türkiye'nin coğrafi özelliklerini öğrenin. Fiziki coğrafya, iklim, bitki örtüsü ve nüfus konularını kapsar.	\N	229.00	\N	f	\N	\N	c1b0e9dc-f691-4728-be68-f7cf21d82198	\N	f	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	2026-01-15 04:16:28.437635	published
2eaec894-3a39-46a7-add2-cb090b5b18a7	Biyoloji - Hücre Yapısı	biyoloji-hucre-yapisi	Hücre yapısı ve işlevlerini öğrenin. Hücre organelleri, hücre bölünmesi ve genetik konularını kapsar.	\N	379.00	\N	f	\N	\N	0e096750-b455-4cb8-b887-4ebc66fde107	\N	f	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	2026-01-17 04:16:28.432282	published
34d57788-3c4b-442f-9fc8-76873ac7cc13	İngilizce - Başlangıç Seviyesi	ingilizce-baslangic-seviyesi	İngilizce öğrenmeye başlayın. Temel kelimeler, gramer kuralları ve konuşma pratiği ile İngilizce dünyasına adım atın.	\N	449.00	299.00	t	\N	\N	9bb65634-56d3-489b-b405-a5948deec543	\N	f	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	2026-01-18 04:16:28.429125	published
34f3f43d-25db-42d6-ab5e-322ce806168d	Kimya - Organik Kimya	kimya-organik-kimya	Organik kimya temellerini öğrenin. Karbon bileşikleri, reaksiyonlar ve organik sentez konularını kapsar.	\N	349.00	249.00	f	\N	\N	89ef4d93-9840-4400-85b8-5583d1739982	\N	f	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	2026-01-20 04:16:28.423929	published
810eba37-85e7-42a3-b854-ebe7a5ec9aaa	Türkçe - Dil Bilgisi	turkce-dil-bilgisi	Türkçe dil bilgisi kurallarını öğrenin. İsimler, fiiller, sıfatlar ve zarflar konularını detaylı bir şekilde işleyin.	\N	199.00	\N	f	\N	\N	c1b0e9dc-f691-4728-be68-f7cf21d82198	\N	f	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	2026-01-19 04:16:28.426532	published
a02d2272-ebf7-4608-b0af-9fd925be3859	Uzay Hoca	uzay-hoca	Uzay Hoca	\N	200.00	\N	f	\N	\N	66e151fd-134f-4cfd-a4d9-0098b6af6001	\N	f	2026-01-23 10:07:58.58552	2026-01-23 10:07:58.58552	\N	draft
\.


--
-- Data for Name: crm_audience_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crm_audience_members (id, audience_id, user_id, created_at) FROM stdin;
920d37f4-dc4f-4e4d-9ef2-a259fca46793	152c4587-c510-408a-bd6f-51b4b65c84a2	54157c4d-9992-44aa-9a47-9bac2e5fbd88	2026-02-06 14:42:49.9577
7d99d38e-013a-47b9-990e-fe67ea952324	152c4587-c510-408a-bd6f-51b4b65c84a2	0732bf99-d96b-4b0c-9dae-a4ce916623b1	2026-02-06 14:42:49.9577
ede0cd8d-b0da-4f8f-8133-3d8d24b6b276	152c4587-c510-408a-bd6f-51b4b65c84a2	51af4383-2b88-4de0-a073-4964625dbda1	2026-02-06 14:42:49.9577
f9984fb5-f00f-4b8d-a462-c1d9ff8613ee	03e15191-e43d-4d40-b6cb-1938388e9eff	d0508689-b22e-4d2b-800b-615d115e98ee	2026-02-06 15:17:13.548104
8cb9fea2-34f3-4cea-ad46-60aa6b1cacc9	03e15191-e43d-4d40-b6cb-1938388e9eff	54157c4d-9992-44aa-9a47-9bac2e5fbd88	2026-02-06 15:17:13.548104
2bafad45-0b36-40ca-85c2-abc6a429e545	03e15191-e43d-4d40-b6cb-1938388e9eff	0732bf99-d96b-4b0c-9dae-a4ce916623b1	2026-02-06 15:17:13.548104
c6cc0997-8dc3-4f2f-9bd0-85e30ac893d3	03e15191-e43d-4d40-b6cb-1938388e9eff	51af4383-2b88-4de0-a073-4964625dbda1	2026-02-06 15:17:13.548104
ec01c5e7-f333-4083-b869-df22b262287a	352d9a0f-2cc5-4943-b347-e73c381b77af	66e151fd-134f-4cfd-a4d9-0098b6af6001	2026-02-09 10:02:32.890842
d2c2b5ae-47c7-4a12-ae8b-55ec4a42e58e	352d9a0f-2cc5-4943-b347-e73c381b77af	0e096750-b455-4cb8-b887-4ebc66fde107	2026-02-09 10:02:32.890842
d2cbf456-f372-48f9-a99c-dd9017ee08c4	352d9a0f-2cc5-4943-b347-e73c381b77af	c1b0e9dc-f691-4728-be68-f7cf21d82198	2026-02-09 10:02:32.890842
20a7c179-9f4c-47a5-9dce-bf66f9188dd9	2bba0966-31d3-45b5-9329-74f4e5efe279	d0508689-b22e-4d2b-800b-615d115e98ee	2026-02-11 11:15:10.358113
8fd6125a-ad7b-4fc0-a5dc-bdd75d26f882	2bba0966-31d3-45b5-9329-74f4e5efe279	54157c4d-9992-44aa-9a47-9bac2e5fbd88	2026-02-11 11:15:10.358113
4404153f-39b8-49a2-b0cc-65e1695207ea	2bba0966-31d3-45b5-9329-74f4e5efe279	51af4383-2b88-4de0-a073-4964625dbda1	2026-02-11 11:15:10.358113
\.


--
-- Data for Name: crm_audiences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crm_audiences (id, name, description, created_by, created_at, updated_at) FROM stdin;
152c4587-c510-408a-bd6f-51b4b65c84a2	Test	Test	\N	2026-02-06 12:24:59.906501	2026-02-06 12:24:59.906501
03e15191-e43d-4d40-b6cb-1938388e9eff	TestlerinTesti	TestlerinTesti	\N	2026-02-06 14:09:06.985061	2026-02-06 14:09:06.985061
352d9a0f-2cc5-4943-b347-e73c381b77af	Kitle-2	Örnek kitledir. 	1dc668fb-5653-44b6-bc99-ba0df7820504	2026-02-09 10:02:32.890842	2026-02-09 10:02:32.890842
2bba0966-31d3-45b5-9329-74f4e5efe279	Deneme Segment 2	\N	1dc668fb-5653-44b6-bc99-ba0df7820504	2026-02-11 11:15:10.358113	2026-02-11 11:15:10.358113
\.


--
-- Data for Name: crm_email_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crm_email_templates (id, name, subject, html_body, plain_body, description, variables_json, created_by, created_at, updated_at) FROM stdin;
0db74ea5-ed68-4656-a02a-a98856244c2f	Starter CRM - Momentum	Sana ozel yeni firsatlar var, {{ full_name }}	<div style="background:#f6efe6;padding:28px;font-family:Georgia,'Times New Roman',serif;color:#1f2937;">\n  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadfd1;border-radius:16px;overflow:hidden;box-shadow:0 18px 35px rgba(20,16,12,.12)">\n    <div style="padding:30px;background:linear-gradient(135deg,#0f766e 0%,#14532d 100%);color:#fff;position:relative;">\n      <div style="position:absolute;right:-24px;top:-24px;width:120px;height:120px;border-radius:999px;background:rgba(255,255,255,.13);"></div>\n      <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.8">BiHocam CRM</div>\n      <h1 style="margin:12px 0 0 0;font-size:34px;line-height:1.05;">{{ offer_title }}</h1>\n      <p style="margin:12px 0 0 0;font-size:15px;opacity:.92">Merhaba {{ full_name }}, senin icin secilen firsatlar burada.</p>\n    </div>\n    <div style="padding:26px;">\n      <p style="font-size:16px;line-height:1.65;margin:0 0 16px 0;">Bu kampanyaya <strong style="color:#b45309">{{ offer_deadline }}</strong> tarihine kadar ulasabilirsin.</p>\n      <div style="margin:18px 0;padding:14px 16px;border:1px dashed #fb923c;background:#fff7ed;border-radius:12px;">\n        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9a3412;">Kampanya Kodu</div>\n        <div style="font-size:24px;font-weight:700;color:#7c2d12;margin-top:4px;">{{ coupon_code }}</div>\n      </div>\n      <a href="{{ cta_url }}" style="display:inline-block;margin-top:6px;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">Firsati Incele</a>\n    </div>\n    <div style="padding:16px 26px;border-top:1px solid #f1e7da;background:#fffbf6;font-size:12px;color:#6b7280;">\n      Bu e-postayi almak istemiyorsan bildirim ayarlarini guncelleyebilirsin.\n    </div>\n  </div>\n</div>	Merhaba {{ full_name }}, {{ offer_title }} kampanyasi aktif. Son tarih: {{ offer_deadline }}. Kupon: {{ coupon_code }}. Detay: {{ cta_url }}	Kurs lansmani, duyuru ve teklif kampanyalari icin modern baslangic sablonu.	["full_name", "email", "offer_title", "offer_deadline", "cta_url", "coupon_code"]	\N	2026-02-06 12:25:08.383822	2026-02-06 12:25:08.383822
\.


--
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_logs (id, notification_id, to_email, subject, template_name, status, attempt_count, last_error, sent_at, payload, created_at, updated_at) FROM stdin;
9ff194f6-6ebb-4b7f-a3a4-f9c2664177c0	\N	yunusg@summarify.io	Sana ozel yeni firsatlar var, Ali Veli A	custom_template	sent	5	\N	2026-02-06 14:46:46.291016	{"to_email": "yunusg@summarify.io", "subject": "Sana ozel yeni firsatlar var, Ali Veli A", "html_body": "<div style=\\"background:#f6efe6;padding:28px;font-family:Georgia,'Times New Roman',serif;color:#1f2937;\\">\\n  <div style=\\"max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadfd1;border-radius:16px;overflow:hidden;box-shadow:0 18px 35px rgba(20,16,12,.12)\\">\\n    <div style=\\"padding:30px;background:linear-gradient(135deg,#0f766e 0%,#14532d 100%);color:#fff;position:relative;\\">\\n      <div style=\\"position:absolute;right:-24px;top:-24px;width:120px;height:120px;border-radius:999px;background:rgba(255,255,255,.13);\\"></div>\\n      <div style=\\"font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.8\\">BiHocam CRM</div>\\n      <h1 style=\\"margin:12px 0 0 0;font-size:34px;line-height:1.05;\\"></h1>\\n      <p style=\\"margin:12px 0 0 0;font-size:15px;opacity:.92\\">Merhaba Ali Veli A, senin icin secilen firsatlar burada.</p>\\n    </div>\\n    <div style=\\"padding:26px;\\">\\n      <p style=\\"font-size:16px;line-height:1.65;margin:0 0 16px 0;\\">Bu kampanyaya <strong style=\\"color:#b45309\\"></strong> tarihine kadar ulasabilirsin.</p>\\n      <div style=\\"margin:18px 0;padding:14px 16px;border:1px dashed #fb923c;background:#fff7ed;border-radius:12px;\\">\\n        <div style=\\"font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9a3412;\\">Kampanya Kodu</div>\\n        <div style=\\"font-size:24px;font-weight:700;color:#7c2d12;margin-top:4px;\\"></div>\\n      </div>\\n      <a href=\\"\\" style=\\"display:inline-block;margin-top:6px;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;\\">Firsati Incele</a>\\n    </div>\\n    <div style=\\"padding:16px 26px;border-top:1px solid #f1e7da;background:#fffbf6;font-size:12px;color:#6b7280;\\">\\n      Bu e-postayi almak istemiyorsan bildirim ayarlarini guncelleyebilirsin.\\n    </div>\\n  </div>\\n</div>", "plain_body": "Merhaba Ali Veli A,  kampanyasi aktif. Son tarih: . Kupon: . Detay: ", "context": {"user_id": "51af4383-2b88-4de0-a073-4964625dbda1", "full_name": "Ali Veli A", "email": "yunusg@summarify.io", "role": "student"}, "template_id": "0db74ea5-ed68-4656-a02a-a98856244c2f", "segment_key": null}	2026-02-06 13:24:36.63303	2026-02-06 14:46:44.416603
0f8c001c-5794-40cb-af4a-6a4e7fabd940	\N	ogrenci2@bihocam.com	Sana ozel yeni firsatlar var, Zeynep Yıldız	custom_template	sent	1	\N	2026-02-06 14:47:07.297168	{"to_email": "ogrenci2@bihocam.com", "subject": "Sana ozel yeni firsatlar var, Zeynep Y\\u0131ld\\u0131z", "html_body": "<div style=\\"background:#f6efe6;padding:28px;font-family:Georgia,'Times New Roman',serif;color:#1f2937;\\">\\n  <div style=\\"max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadfd1;border-radius:16px;overflow:hidden;box-shadow:0 18px 35px rgba(20,16,12,.12)\\">\\n    <div style=\\"padding:30px;background:linear-gradient(135deg,#0f766e 0%,#14532d 100%);color:#fff;position:relative;\\">\\n      <div style=\\"position:absolute;right:-24px;top:-24px;width:120px;height:120px;border-radius:999px;background:rgba(255,255,255,.13);\\"></div>\\n      <div style=\\"font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.8\\">BiHocam CRM</div>\\n      <h1 style=\\"margin:12px 0 0 0;font-size:34px;line-height:1.05;\\"></h1>\\n      <p style=\\"margin:12px 0 0 0;font-size:15px;opacity:.92\\">Merhaba Zeynep Y\\u0131ld\\u0131z, senin icin secilen firsatlar burada.</p>\\n    </div>\\n    <div style=\\"padding:26px;\\">\\n      <p style=\\"font-size:16px;line-height:1.65;margin:0 0 16px 0;\\">Bu kampanyaya <strong style=\\"color:#b45309\\"></strong> tarihine kadar ulasabilirsin.</p>\\n      <div style=\\"margin:18px 0;padding:14px 16px;border:1px dashed #fb923c;background:#fff7ed;border-radius:12px;\\">\\n        <div style=\\"font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9a3412;\\">Kampanya Kodu</div>\\n        <div style=\\"font-size:24px;font-weight:700;color:#7c2d12;margin-top:4px;\\"></div>\\n      </div>\\n      <a href=\\"\\" style=\\"display:inline-block;margin-top:6px;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;\\">Firsati Incele</a>\\n    </div>\\n    <div style=\\"padding:16px 26px;border-top:1px solid #f1e7da;background:#fffbf6;font-size:12px;color:#6b7280;\\">\\n      Bu e-postayi almak istemiyorsan bildirim ayarlarini guncelleyebilirsin.\\n    </div>\\n  </div>\\n</div>", "plain_body": "Merhaba Zeynep Y\\u0131ld\\u0131z,  kampanyasi aktif. Son tarih: . Kupon: . Detay: ", "context": {"user_id": "54157c4d-9992-44aa-9a47-9bac2e5fbd88", "full_name": "Zeynep Y\\u0131ld\\u0131z", "email": "ogrenci2@bihocam.com", "role": "student"}, "template_id": "0db74ea5-ed68-4656-a02a-a98856244c2f", "segment_key": "all_students"}	2026-02-06 13:19:09.220871	2026-02-06 14:47:05.291466
479d8266-a02d-47af-ae37-d590b70c2567	\N	ogrenci1@bihocam.com	Sana ozel yeni firsatlar var, Ali Veli A	custom_template	sent	2	\N	2026-02-06 14:47:13.411178	{"to_email": "ogrenci1@bihocam.com", "subject": "Sana ozel yeni firsatlar var, Ali Veli A", "html_body": "<div style=\\"background:#f6efe6;padding:28px;font-family:Georgia,'Times New Roman',serif;color:#1f2937;\\">\\n  <div style=\\"max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadfd1;border-radius:16px;overflow:hidden;box-shadow:0 18px 35px rgba(20,16,12,.12)\\">\\n    <div style=\\"padding:30px;background:linear-gradient(135deg,#0f766e 0%,#14532d 100%);color:#fff;position:relative;\\">\\n      <div style=\\"position:absolute;right:-24px;top:-24px;width:120px;height:120px;border-radius:999px;background:rgba(255,255,255,.13);\\"></div>\\n      <div style=\\"font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.8\\">BiHocam CRM</div>\\n      <h1 style=\\"margin:12px 0 0 0;font-size:34px;line-height:1.05;\\"></h1>\\n      <p style=\\"margin:12px 0 0 0;font-size:15px;opacity:.92\\">Merhaba Ali Veli A, senin icin secilen firsatlar burada.</p>\\n    </div>\\n    <div style=\\"padding:26px;\\">\\n      <p style=\\"font-size:16px;line-height:1.65;margin:0 0 16px 0;\\">Bu kampanyaya <strong style=\\"color:#b45309\\"></strong> tarihine kadar ulasabilirsin.</p>\\n      <div style=\\"margin:18px 0;padding:14px 16px;border:1px dashed #fb923c;background:#fff7ed;border-radius:12px;\\">\\n        <div style=\\"font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9a3412;\\">Kampanya Kodu</div>\\n        <div style=\\"font-size:24px;font-weight:700;color:#7c2d12;margin-top:4px;\\"></div>\\n      </div>\\n      <a href=\\"\\" style=\\"display:inline-block;margin-top:6px;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;\\">Firsati Incele</a>\\n    </div>\\n    <div style=\\"padding:16px 26px;border-top:1px solid #f1e7da;background:#fffbf6;font-size:12px;color:#6b7280;\\">\\n      Bu e-postayi almak istemiyorsan bildirim ayarlarini guncelleyebilirsin.\\n    </div>\\n  </div>\\n</div>", "plain_body": "Merhaba Ali Veli A,  kampanyasi aktif. Son tarih: . Kupon: . Detay: ", "context": {"user_id": "51af4383-2b88-4de0-a073-4964625dbda1", "full_name": "Ali Veli A", "email": "ogrenci1@bihocam.com", "role": "student"}, "template_id": "0db74ea5-ed68-4656-a02a-a98856244c2f", "segment_key": "all_students"}	2026-02-06 13:19:09.220871	2026-02-06 14:47:11.359006
89bc8e17-3b4c-4a2a-a070-bde0e3665dbb	\N	ali@test.com	Sana ozel yeni firsatlar var, Ali G	custom_template	sent	1	\N	2026-02-06 14:47:21.055392	{"to_email": "ali@test.com", "subject": "Sana ozel yeni firsatlar var, Ali G", "html_body": "<div style=\\"background:#f6efe6;padding:28px;font-family:Georgia,'Times New Roman',serif;color:#1f2937;\\">\\n  <div style=\\"max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadfd1;border-radius:16px;overflow:hidden;box-shadow:0 18px 35px rgba(20,16,12,.12)\\">\\n    <div style=\\"padding:30px;background:linear-gradient(135deg,#0f766e 0%,#14532d 100%);color:#fff;position:relative;\\">\\n      <div style=\\"position:absolute;right:-24px;top:-24px;width:120px;height:120px;border-radius:999px;background:rgba(255,255,255,.13);\\"></div>\\n      <div style=\\"font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.8\\">BiHocam CRM</div>\\n      <h1 style=\\"margin:12px 0 0 0;font-size:34px;line-height:1.05;\\"></h1>\\n      <p style=\\"margin:12px 0 0 0;font-size:15px;opacity:.92\\">Merhaba Ali G, senin icin secilen firsatlar burada.</p>\\n    </div>\\n    <div style=\\"padding:26px;\\">\\n      <p style=\\"font-size:16px;line-height:1.65;margin:0 0 16px 0;\\">Bu kampanyaya <strong style=\\"color:#b45309\\"></strong> tarihine kadar ulasabilirsin.</p>\\n      <div style=\\"margin:18px 0;padding:14px 16px;border:1px dashed #fb923c;background:#fff7ed;border-radius:12px;\\">\\n        <div style=\\"font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9a3412;\\">Kampanya Kodu</div>\\n        <div style=\\"font-size:24px;font-weight:700;color:#7c2d12;margin-top:4px;\\"></div>\\n      </div>\\n      <a href=\\"\\" style=\\"display:inline-block;margin-top:6px;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;\\">Firsati Incele</a>\\n    </div>\\n    <div style=\\"padding:16px 26px;border-top:1px solid #f1e7da;background:#fffbf6;font-size:12px;color:#6b7280;\\">\\n      Bu e-postayi almak istemiyorsan bildirim ayarlarini guncelleyebilirsin.\\n    </div>\\n  </div>\\n</div>", "plain_body": "Merhaba Ali G,  kampanyasi aktif. Son tarih: . Kupon: . Detay: ", "context": {"user_id": "d0508689-b22e-4d2b-800b-615d115e98ee", "full_name": "Ali G", "email": "ali@test.com", "role": "student"}, "template_id": "0db74ea5-ed68-4656-a02a-a98856244c2f", "segment_key": "all_students"}	2026-02-06 13:19:09.220871	2026-02-06 14:47:19.019847
759ebe1b-abb5-43c7-8dc8-828ed6f7b0ab	\N	direct3@test.com	Sana ozel yeni firsatlar var, Direct Test	custom_template	sent	4	\N	2026-02-06 14:46:49.737448	{"to_email": "direct3@test.com", "subject": "Sana ozel yeni firsatlar var, Direct Test", "html_body": "<div style=\\"background:#f6efe6;padding:28px;font-family:Georgia,'Times New Roman',serif;color:#1f2937;\\">\\n  <div style=\\"max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadfd1;border-radius:16px;overflow:hidden;box-shadow:0 18px 35px rgba(20,16,12,.12)\\">\\n    <div style=\\"padding:30px;background:linear-gradient(135deg,#0f766e 0%,#14532d 100%);color:#fff;position:relative;\\">\\n      <div style=\\"position:absolute;right:-24px;top:-24px;width:120px;height:120px;border-radius:999px;background:rgba(255,255,255,.13);\\"></div>\\n      <div style=\\"font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.8\\">BiHocam CRM</div>\\n      <h1 style=\\"margin:12px 0 0 0;font-size:34px;line-height:1.05;\\"></h1>\\n      <p style=\\"margin:12px 0 0 0;font-size:15px;opacity:.92\\">Merhaba Direct Test, senin icin secilen firsatlar burada.</p>\\n    </div>\\n    <div style=\\"padding:26px;\\">\\n      <p style=\\"font-size:16px;line-height:1.65;margin:0 0 16px 0;\\">Bu kampanyaya <strong style=\\"color:#b45309\\"></strong> tarihine kadar ulasabilirsin.</p>\\n      <div style=\\"margin:18px 0;padding:14px 16px;border:1px dashed #fb923c;background:#fff7ed;border-radius:12px;\\">\\n        <div style=\\"font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9a3412;\\">Kampanya Kodu</div>\\n        <div style=\\"font-size:24px;font-weight:700;color:#7c2d12;margin-top:4px;\\"></div>\\n      </div>\\n      <a href=\\"\\" style=\\"display:inline-block;margin-top:6px;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;\\">Firsati Incele</a>\\n    </div>\\n    <div style=\\"padding:16px 26px;border-top:1px solid #f1e7da;background:#fffbf6;font-size:12px;color:#6b7280;\\">\\n      Bu e-postayi almak istemiyorsan bildirim ayarlarini guncelleyebilirsin.\\n    </div>\\n  </div>\\n</div>", "plain_body": "Merhaba Direct Test,  kampanyasi aktif. Son tarih: . Kupon: . Detay: ", "context": {"user_id": "0732bf99-d96b-4b0c-9dae-a4ce916623b1", "full_name": "Direct Test", "email": "direct3@test.com", "role": "student"}, "template_id": "0db74ea5-ed68-4656-a02a-a98856244c2f", "segment_key": "all_students"}	2026-02-06 13:19:09.220871	2026-02-06 14:46:47.681976
039c73be-0ad0-439f-aec6-70d7303fb7f2	64c03272-5109-4a78-b72e-5706de6b8382	ogrenci1@bihocam.com	Yorumunuz Onaylandı	\N	pending	0	\N	\N	{"to_email": "ogrenci1@bihocam.com", "subject": "Yorumunuz Onayland\\u0131", "template_name": null, "context": {"user_name": "Ali Veli A", "teacher_name": "Ali Veli A", "title": "Yorumunuz Onayland\\u0131", "message": "\\"\\u00dccretsiz Kurs\\" kursuna yapt\\u0131\\u011f\\u0131n\\u0131z yorum onayland\\u0131.", "notification_type": "review_approved", "action_url": "/courses/ucretsiz-kurs", "action_label": "Kursu G\\u00f6r\\u00fcnt\\u00fcle"}}	2026-02-11 11:10:44.154044	2026-02-11 11:10:44.154044
9a06688e-cbc3-46cc-829b-2910e0a2e457	\N	yunusg@summarify.io	Sana ozel yeni firsatlar var, Ali Veli A	custom_template	sent	4	\N	2026-02-06 14:49:08.903665	{"to_email": "yunusg@summarify.io", "subject": "Sana ozel yeni firsatlar var, Ali Veli A", "html_body": "<div style=\\"background:#f6efe6;padding:28px;font-family:Georgia,'Times New Roman',serif;color:#1f2937;\\">\\n  <div style=\\"max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadfd1;border-radius:16px;overflow:hidden;box-shadow:0 18px 35px rgba(20,16,12,.12)\\">\\n    <div style=\\"padding:30px;background:linear-gradient(135deg,#0f766e 0%,#14532d 100%);color:#fff;position:relative;\\">\\n      <div style=\\"position:absolute;right:-24px;top:-24px;width:120px;height:120px;border-radius:999px;background:rgba(255,255,255,.13);\\"></div>\\n      <div style=\\"font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.8\\">BiHocam CRM</div>\\n      <h1 style=\\"margin:12px 0 0 0;font-size:34px;line-height:1.05;\\"></h1>\\n      <p style=\\"margin:12px 0 0 0;font-size:15px;opacity:.92\\">Merhaba Ali Veli A, senin icin secilen firsatlar burada.</p>\\n    </div>\\n    <div style=\\"padding:26px;\\">\\n      <p style=\\"font-size:16px;line-height:1.65;margin:0 0 16px 0;\\">Bu kampanyaya <strong style=\\"color:#b45309\\"></strong> tarihine kadar ulasabilirsin.</p>\\n      <div style=\\"margin:18px 0;padding:14px 16px;border:1px dashed #fb923c;background:#fff7ed;border-radius:12px;\\">\\n        <div style=\\"font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9a3412;\\">Kampanya Kodu</div>\\n        <div style=\\"font-size:24px;font-weight:700;color:#7c2d12;margin-top:4px;\\"></div>\\n      </div>\\n      <a href=\\"\\" style=\\"display:inline-block;margin-top:6px;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;\\">Firsati Incele</a>\\n    </div>\\n    <div style=\\"padding:16px 26px;border-top:1px solid #f1e7da;background:#fffbf6;font-size:12px;color:#6b7280;\\">\\n      Bu e-postayi almak istemiyorsan bildirim ayarlarini guncelleyebilirsin.\\n    </div>\\n  </div>\\n</div>", "plain_body": "Merhaba Ali Veli A,  kampanyasi aktif. Son tarih: . Kupon: . Detay: ", "context": {"user_id": "51af4383-2b88-4de0-a073-4964625dbda1", "full_name": "Ali Veli A", "email": "yunusg@summarify.io", "role": "student"}, "template_id": "0db74ea5-ed68-4656-a02a-a98856244c2f", "segment_key": null}	2026-02-06 14:42:55.761941	2026-02-06 14:49:07.021329
91f39a70-c76e-4e22-bc73-461e19a61076	659f21e4-40c0-4c24-95d4-0138d67b3f32	yunusg@summarify.io	Eğitmeniniz Yorumunuza Cevap Verdi	\N	pending	0	\N	\N	{"to_email": "yunusg@summarify.io", "subject": "E\\u011fitmeniniz Yorumunuza Cevap Verdi", "template_name": null, "context": {"user_name": "Ali Veli A", "teacher_name": "Ali Veli A", "title": "E\\u011fitmeniniz Yorumunuza Cevap Verdi", "message": "\\"Matematik - Temel Seviye\\" kursuna yapt\\u0131\\u011f\\u0131n\\u0131z yoruma e\\u011fitmen cevap verdi.", "notification_type": "teacher_reply", "action_url": "/courses/matematik-temel-seviye", "action_label": "Yorumu G\\u00f6r\\u00fcnt\\u00fcle"}}	2026-02-07 13:36:31.504769	2026-02-07 13:36:31.504769
18108677-bea5-434b-9ee9-d227f853f03f	faa93de9-0836-4107-81fc-e43328a24abc	yunusg@summarify.io	Yeni Canlı Ders: Canlı Test Dersi	\N	pending	0	\N	\N	{"to_email": "yunusg@summarify.io", "subject": "Yeni Canl\\u0131 Ders: Canl\\u0131 Test Dersi", "template_name": null, "context": {"user_name": "Ali Veli A", "teacher_name": "Ali Veli A", "title": "Yeni Canl\\u0131 Ders: Canl\\u0131 Test Dersi", "message": "\\u00dccretsiz Kurs kursunda yeni bir canl\\u0131 ders planland\\u0131. Tarih: 09.02.2026 12:12 UTC", "notification_type": "live_lesson_reminder", "action_url": "/courses/ucretsiz-kurs", "action_label": "Kursa Git", "course_id": "20368b4c-1103-4f33-9ccb-c8b9fbb3acc4", "lesson_id": "23ed7acd-b060-487a-93ad-5a560cc5ca9d", "live_lesson_at": "2026-02-09T12:12:00+00:00", "live_lesson_url": "https://meet.google.com/wtz-kxio-ggz"}}	2026-02-09 03:04:58.226796	2026-02-09 03:04:58.226796
86d3878b-5aff-4e27-8e3a-b5000d48d65d	ef239f57-3329-47ac-a1d3-08d8d8fbe4f0	ogrenci1@bihocam.com	Yeni Canlı Ders: Canlı Ders -3	\N	pending	0	\N	\N	{"to_email": "ogrenci1@bihocam.com", "subject": "Yeni Canl\\u0131 Ders: Canl\\u0131 Ders -3", "template_name": null, "context": {"user_name": "Ali Veli A", "teacher_name": "Ali Veli A", "title": "Yeni Canl\\u0131 Ders: Canl\\u0131 Ders -3", "message": "\\u00dccretsiz Kurs kursunda yeni bir canl\\u0131 ders planland\\u0131. Tarih: 11.02.2026 14:20 UTC", "notification_type": "live_lesson_reminder", "action_url": "/courses/ucretsiz-kurs", "action_label": "Kursa Git", "course_id": "20368b4c-1103-4f33-9ccb-c8b9fbb3acc4", "lesson_id": "31a0a043-76f6-4fb3-92a3-bf06f7d56dfd", "live_lesson_at": "2026-02-11T14:20:00+00:00", "live_lesson_url": "https://meet.google.com/wtz-kxio-ggz"}}	2026-02-11 11:17:34.452044	2026-02-11 11:17:34.452044
dd8e2a67-b149-44f0-8e44-d2c41c25a40d	85a3f540-a3c4-408c-bdad-0ed119f5a3cc	ogrenci1@bihocam.com	Canlı Ders Yeniden Zamanlandı: Canlı Ders -3	\N	pending	0	\N	\N	{"to_email": "ogrenci1@bihocam.com", "subject": "Canl\\u0131 Ders Yeniden Zamanland\\u0131: Canl\\u0131 Ders -3", "template_name": null, "context": {"user_name": "Ali Veli A", "teacher_name": "Ali Veli A", "title": "Canl\\u0131 Ders Yeniden Zamanland\\u0131: Canl\\u0131 Ders -3", "message": "\\u00dccretsiz Kurs kursundaki canl\\u0131 ders yeniden zamanland\\u0131. Tarih: 11.02.2026 11:20 \\u2192 11.02.2026 11:10 UTC", "notification_type": "live_lesson_reminder", "action_url": "/courses/ucretsiz-kurs", "action_label": "Kursa Git", "course_id": "20368b4c-1103-4f33-9ccb-c8b9fbb3acc4", "lesson_id": "31a0a043-76f6-4fb3-92a3-bf06f7d56dfd", "live_lesson_at": "2026-02-11T11:10:00+00:00", "live_lesson_url": "https://meet.google.com/wtz-kxio-ggz"}}	2026-02-11 11:18:12.891396	2026-02-11 11:18:12.891396
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (id, user_id, course_id, order_id, progress_percentage, last_accessed_at, completed_at, enrolled_at) FROM stdin;
46087770-c047-424b-a64b-6853e22e031b	51af4383-2b88-4de0-a073-4964625dbda1	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	\N	0	\N	\N	2026-01-23 14:51:01.770604
605010c3-54ca-443c-9fad-3433c2315901	51af4383-2b88-4de0-a073-4964625dbda1	34f3f43d-25db-42d6-ab5e-322ce806168d	\N	0	\N	\N	2026-01-23 14:51:01.770604
b81f1d02-8532-4b2b-8ae2-6bef3f439351	54157c4d-9992-44aa-9a47-9bac2e5fbd88	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	\N	0	\N	\N	2026-01-23 14:51:01.770604
3f1a22a8-fc2b-4cc2-9c31-9071b105da43	54157c4d-9992-44aa-9a47-9bac2e5fbd88	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	\N	0	\N	\N	2026-01-23 14:51:01.770604
a19bd1e3-29d8-48b4-82cf-f7726e7c6e66	54157c4d-9992-44aa-9a47-9bac2e5fbd88	34f3f43d-25db-42d6-ab5e-322ce806168d	\N	0	\N	\N	2026-01-23 14:51:01.770604
0d0a9d62-e772-43dc-915c-bd5e7de85e4f	51af4383-2b88-4de0-a073-4964625dbda1	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	\N	60	2026-02-05 01:02:06.599441	\N	2026-01-23 14:51:01.770604
aa9ba43b-eb8c-4e80-bce6-41d1e868006f	51af4383-2b88-4de0-a073-4964625dbda1	def3437c-27ee-4775-a2a4-a40bfec1012a	f0ddd39f-f42d-4e9f-9d7b-e0c9d81e9f3c	0	\N	\N	2026-02-06 02:17:30.609348
6069d983-40ce-4440-b244-1e07e48943f3	51af4383-2b88-4de0-a073-4964625dbda1	eeb69cbd-d481-434e-b487-b628fea37c96	7964bda6-640f-4c0c-8421-3d8939d091fc	0	\N	\N	2026-02-11 11:12:28.915837
0f1a27a4-145d-4c54-8858-fa65fba5695e	9bb65634-56d3-489b-b405-a5948deec543	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	e6e728f8-eacb-4eed-8a0d-077aff2f0a13	0	\N	\N	2026-02-23 03:30:45.751677
0015d877-d88b-42ed-bf91-fd97bba57def	1dc668fb-5653-44b6-bc99-ba0df7820504	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	a11b6616-346b-42d4-956c-3d4f99f1b896	0	\N	\N	2026-02-23 03:30:47.20181
aa18f130-b1fe-4598-90c9-08d545111993	1dc668fb-5653-44b6-bc99-ba0df7820504	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	277c0161-8620-46a6-afb4-6ca73e7b4950	0	\N	\N	2026-02-23 03:30:48.500581
df494fc7-05b5-4f2d-9a35-c31562d5c827	51af4383-2b88-4de0-a073-4964625dbda1	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	b60567fb-62fd-4a00-a603-60770a933aaa	83	2026-03-06 20:48:33.762084	2026-02-11 09:39:24.876256	2026-02-06 02:14:20.906085
\.


--
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_progress (id, user_id, lesson_id, enrollment_id, watched_seconds, is_completed, completed_at, first_accessed_at, last_accessed_at, created_at, updated_at) FROM stdin;
d5d8ed39-bb23-4f4e-b8b2-f5c21136e9e3	51af4383-2b88-4de0-a073-4964625dbda1	6f005aa6-c6de-449f-aafa-61a795b28ba6	46087770-c047-424b-a64b-6853e22e031b	300	f	\N	2026-01-23 14:51:01.770604	2026-01-23 14:51:01.770604	2026-01-23 14:51:01.770604	2026-01-23 14:51:01.770604
047e5dd3-eee5-4d0c-b32a-038ad4de6750	51af4383-2b88-4de0-a073-4964625dbda1	08d3696e-d482-445d-9d67-b831d140e335	605010c3-54ca-443c-9fad-3433c2315901	300	f	\N	2026-01-23 14:51:01.770604	2026-01-23 14:51:01.770604	2026-01-23 14:51:01.770604	2026-01-23 14:51:01.770604
ebd4f444-e462-4b45-9d9b-962781a06905	51af4383-2b88-4de0-a073-4964625dbda1	aa465e8c-a27e-4355-84d2-fa9502f0ad71	0d0a9d62-e772-43dc-915c-bd5e7de85e4f	21	t	2026-02-04 19:00:23.657085	2026-01-23 14:51:01.770604	2026-02-04 19:00:23.651137	2026-01-23 14:51:01.770604	2026-02-04 19:00:23.651137
2af0f31a-e879-4b61-ad8d-cb9fd3171702	51af4383-2b88-4de0-a073-4964625dbda1	6e54f73a-9253-4665-b893-058872291ae2	0d0a9d62-e772-43dc-915c-bd5e7de85e4f	0	t	2026-02-05 01:02:05.025708	2026-02-05 01:02:05.020712	2026-02-05 01:02:05.020712	2026-02-05 01:02:05.020712	2026-02-05 01:02:05.020712
8b37ee97-8e11-4554-ab0a-2f85209ee036	51af4383-2b88-4de0-a073-4964625dbda1	98b26e99-2a3b-438b-af9f-aa64357dc725	0d0a9d62-e772-43dc-915c-bd5e7de85e4f	0	t	2026-02-05 01:02:06.603833	2026-02-05 01:02:06.599441	2026-02-05 01:02:06.599441	2026-02-05 01:02:06.599441	2026-02-05 01:02:06.599441
c5395619-7acc-40a0-9a31-e7cdd8293f79	51af4383-2b88-4de0-a073-4964625dbda1	ddf8fef6-4d09-4cc6-b179-97e95bbf0d8a	df494fc7-05b5-4f2d-9a35-c31562d5c827	0	t	2026-02-09 06:04:30.444974	2026-02-09 06:04:30.437571	2026-02-09 06:04:30.437571	2026-02-09 06:04:30.437571	2026-02-09 06:04:30.437571
6bc69d70-8c55-4efe-b587-c5cac9e23e1d	51af4383-2b88-4de0-a073-4964625dbda1	69bbe0d2-ddcd-40b6-b8f2-3ffe76bf49cf	df494fc7-05b5-4f2d-9a35-c31562d5c827	37	t	2026-02-11 01:22:34.995205	2026-02-11 01:22:34.990144	2026-02-11 01:22:34.990144	2026-02-11 01:22:34.990144	2026-02-11 01:22:34.990144
c0b9c78f-cada-4814-8d44-484195d23369	51af4383-2b88-4de0-a073-4964625dbda1	da5e3f9f-39b3-4384-9b6c-b198411cf546	df494fc7-05b5-4f2d-9a35-c31562d5c827	0	t	2026-02-11 09:34:10.105216	2026-02-11 09:34:10.101651	2026-02-11 09:34:10.101651	2026-02-11 09:34:10.101651	2026-02-11 09:34:10.101651
f48a5b3d-817b-4ef0-b195-6043cc6f8a8c	51af4383-2b88-4de0-a073-4964625dbda1	23ed7acd-b060-487a-93ad-5a560cc5ca9d	df494fc7-05b5-4f2d-9a35-c31562d5c827	0	t	2026-02-11 09:34:11.593462	2026-02-11 09:34:11.589874	2026-02-11 09:34:11.589874	2026-02-11 09:34:11.589874	2026-02-11 09:34:11.589874
815da889-52d3-48ae-a2a2-afc57f85bd2b	51af4383-2b88-4de0-a073-4964625dbda1	1c67296e-87a9-4eab-aaa6-5b782ab13f25	df494fc7-05b5-4f2d-9a35-c31562d5c827	0	t	2026-02-11 09:39:24.864983	2026-02-11 09:39:24.859884	2026-02-11 09:39:24.859884	2026-02-11 09:39:24.859884	2026-02-11 09:39:24.859884
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, title, description, lesson_type, content_path, video_url, duration_seconds, "order", is_preview, course_id, created_at, updated_at, content_text, original_filename, file_size_bytes, mime_type, thumbnail_path, live_lesson_url, live_lesson_at, live_lesson_recording_path, is_live_lesson_ended) FROM stdin;
da5e3f9f-39b3-4384-9b6c-b198411cf546	Test 1	Test 1	pdf	documents\\da5e3f9f-39b3-4384-9b6c-b198411cf546_20260209_052030.pdf	\N	\N	2	f	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	2026-02-09 02:20:04.286721	2026-02-09 02:20:30.63144	\N	Final-1711 Teknik Rapor.pdf	562977	application/pdf	\N	\N	\N	\N	f
6e54f73a-9253-4665-b893-058872291ae2	Toplama İşlemi	\N	video	\N	\N	2400	2	f	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
98b26e99-2a3b-438b-af9f-aa64357dc725	Çıkarma İşlemi	\N	video	\N	\N	2400	3	f	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
a24f57ee-143b-4e5b-9489-852b07ccddf4	Çarpma İşlemi	\N	video	\N	\N	3000	4	f	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
c85428be-fa67-4961-a87b-8af12ef7d2b3	Bölme İşlemi	\N	video	\N	\N	3000	5	f	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
6f005aa6-c6de-449f-aafa-61a795b28ba6	Hareket ve Hız	\N	video	\N	\N	3600	1	t	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
fa63577e-ea42-48a5-a3d7-9673f5ae9498	Kuvvet ve Newton Yasaları	\N	video	\N	\N	4200	2	f	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
6c58f2ae-2fbe-4b3e-ac8b-cbf0352213a7	Enerji ve İş	\N	video	\N	\N	3600	3	f	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
4830e79c-c3cd-43fc-9ef0-67bd395584d6	Momentum	\N	video	\N	\N	3000	4	f	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
08d3696e-d482-445d-9d67-b831d140e335	Organik Bileşikler	\N	video	\N	\N	3000	1	t	34f3f43d-25db-42d6-ab5e-322ce806168d	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
ee4bd242-09d9-453a-9037-49adee2247ca	Alkanlar ve Alkenler	\N	video	\N	\N	3600	2	f	34f3f43d-25db-42d6-ab5e-322ce806168d	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
9f8065b8-92af-44de-a90c-d9e08c051de8	Alkoller ve Eterler	\N	video	\N	\N	3000	3	f	34f3f43d-25db-42d6-ab5e-322ce806168d	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
75bb0c30-30cc-4e53-b002-9425245a71d2	Karboksilik Asitler	\N	video	\N	\N	3600	4	f	34f3f43d-25db-42d6-ab5e-322ce806168d	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
5a869d0d-c9ee-461a-8382-5b34e8ec2c03	İsimler ve İsim Tamlamaları	\N	video	\N	\N	2400	1	t	810eba37-85e7-42a3-b854-ebe7a5ec9aaa	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
a84abd99-aea7-4628-9d8a-1f2f536442f0	Fiiller ve Fiil Çekimleri	\N	video	\N	\N	3000	2	f	810eba37-85e7-42a3-b854-ebe7a5ec9aaa	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
c87dc506-5ddf-4574-b3e2-1c42d361d0ed	Sıfatlar ve Zarflar	\N	video	\N	\N	2400	3	f	810eba37-85e7-42a3-b854-ebe7a5ec9aaa	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
e98d008c-0d3e-4eab-8b07-f59a9c47ffef	Edatlar ve Bağlaçlar	\N	video	\N	\N	1800	4	f	810eba37-85e7-42a3-b854-ebe7a5ec9aaa	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
068abcac-eb61-4375-b613-2f42de43466f	Alfabe ve Temel Kelimeler	\N	video	\N	\N	1800	1	t	34d57788-3c4b-442f-9fc8-76873ac7cc13	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
c01ce61a-4db5-472d-8025-a37f10210808	Present Tense	\N	video	\N	\N	3600	2	f	34d57788-3c4b-442f-9fc8-76873ac7cc13	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
924a0c1d-d696-4d9d-9684-3e2e7549c226	Past Tense	\N	video	\N	\N	3600	3	f	34d57788-3c4b-442f-9fc8-76873ac7cc13	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
ab343b9d-b45a-4f0f-903c-c3077a1b1495	Future Tense	\N	video	\N	\N	3000	4	f	34d57788-3c4b-442f-9fc8-76873ac7cc13	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
b7c64e25-c3f5-4b3c-bf05-a24b4f31b333	Konuşma Pratiği	\N	video	\N	\N	4200	5	f	34d57788-3c4b-442f-9fc8-76873ac7cc13	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
78e04e7f-1bf8-4456-80e1-02d9c42988dd	Hücre Yapısı	\N	video	\N	\N	3000	1	t	2eaec894-3a39-46a7-add2-cb090b5b18a7	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
7a0bb61b-748b-43dc-b74e-9208efbe5287	Hücre Organelleri	\N	video	\N	\N	3600	2	f	2eaec894-3a39-46a7-add2-cb090b5b18a7	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
ee7c1697-7b87-4eb9-af98-b5499f410973	Hücre Bölünmesi	\N	video	\N	\N	4200	3	f	2eaec894-3a39-46a7-add2-cb090b5b18a7	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
de3d1b39-ebbc-484f-b462-b44ca56c359f	Genetik ve DNA	\N	video	\N	\N	3600	4	f	2eaec894-3a39-46a7-add2-cb090b5b18a7	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
83c68365-a034-4c25-8eda-c181fe0647ca	Osmanlı'nın Kuruluşu	\N	video	\N	\N	3600	1	t	eeb69cbd-d481-434e-b487-b628fea37c96	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
072615ea-1052-414e-865a-fe8ec78f1985	Yükseliş Dönemi	\N	video	\N	\N	4200	2	f	eeb69cbd-d481-434e-b487-b628fea37c96	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
d6fe0c1d-7ef9-4162-98f6-4f6dc274aabc	Duraklama Dönemi	\N	video	\N	\N	3600	3	f	eeb69cbd-d481-434e-b487-b628fea37c96	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
c37e1fb1-8784-4aec-9bc7-109f68ee61ed	Çöküş ve Dağılma	\N	video	\N	\N	3000	4	f	eeb69cbd-d481-434e-b487-b628fea37c96	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
317437ac-0232-42f1-9371-db45785bbe0c	Türkiye'nin Fiziki Coğrafyası	\N	video	\N	\N	3000	1	t	1809aa06-2c64-4cb9-93a8-ce8f0268c744	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
005c2921-7857-4934-864f-1fd611864415	İklim ve Bitki Örtüsü	\N	video	\N	\N	3600	2	f	1809aa06-2c64-4cb9-93a8-ce8f0268c744	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
dc28668d-7288-4626-b5bf-dddccf1f4c8b	Nüfus ve Yerleşme	\N	video	\N	\N	2400	3	f	1809aa06-2c64-4cb9-93a8-ce8f0268c744	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
3cd94762-8a1e-42a4-a3bf-a84b45c35541	Ekonomik Coğrafya	\N	video	\N	\N	3000	4	f	1809aa06-2c64-4cb9-93a8-ce8f0268c744	2026-01-23 01:16:28.400103	2026-01-23 01:16:28.400103	\N	\N	\N	\N	\N	\N	\N	\N	f
e90c8074-cd4c-4169-a299-2916a9f4afa0	Test	\N	video	videos/e90c8074-cd4c-4169-a299-2916a9f4afa0_20260204_025751.mp4	\N	\N	1	f	c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7	2026-02-03 23:49:07.248648	2026-02-03 23:57:51.290461	\N	\N	\N	\N	\N	\N	\N	\N	f
aa465e8c-a27e-4355-84d2-fa9502f0ad71	Sayılar ve İşlemler	\N	video	videos/aa465e8c-a27e-4355-84d2-fa9502f0ad71_20260204_032857.mp4	\N	1800	1	t	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	2026-01-23 01:16:28.400103	2026-02-04 00:28:57.053899	\N	\N	\N	\N	\N	\N	\N	\N	f
9d7d9293-5a40-4339-8959-f20f792d03dd	Test 	Test	video	videos/9d7d9293-5a40-4339-8959-f20f792d03dd_20260206_050258.mp4	\N	\N	1	f	def3437c-27ee-4775-a2a4-a40bfec1012a	2026-02-05 20:18:42.402742	2026-02-06 02:02:58.090172	\N	\N	\N	\N	\N	\N	\N	\N	f
ddf8fef6-4d09-4cc6-b179-97e95bbf0d8a	QuizDeneme	QuizDeneme	quiz	\N	\N	\N	5	f	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	2026-02-09 04:02:34.869604	2026-02-09 04:02:34.869604	\N	\N	\N	\N	\N	\N	\N	\N	f
9f50d8cc-c305-4e18-9efc-307e79ff9c3f	Test3	Test3	quiz	\N	\N	\N	2	f	def3437c-27ee-4775-a2a4-a40bfec1012a	2026-02-09 09:28:19.306941	2026-02-09 09:28:19.306941	\N	\N	\N	\N	\N	\N	\N	\N	f
23ed7acd-b060-487a-93ad-5a560cc5ca9d	Canlı Test Dersi	Canlı Test Dersi Canlı Test Dersi	live_lesson	\N	\N	\N	3	f	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	2026-02-09 03:04:58.226796	2026-02-11 01:52:10.955628	\N	\N	\N	\N	\N	https://meet.google.com/wtz-kxio-ggz	2026-02-09 09:12:00+00	\N	t
1c67296e-87a9-4eab-aaa6-5b782ab13f25	SunumTest	SunumTest	presentation	documents\\1c67296e-87a9-4eab-aaa6-5b782ab13f25_20260211_045309.pptx	\N	\N	4	f	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	2026-02-09 03:07:56.187349	2026-02-11 01:53:09.001696	\N	99815__31174__sinif_disi_ogretim_teknikleri.pptx	157604	application/vnd.openxmlformats-officedocument.presentationml.presentation	\N	\N	\N	\N	f
69bbe0d2-ddcd-40b6-b8f2-3ffe76bf49cf	Test 2	Test 2	video	videos\\69bbe0d2-ddcd-40b6-b8f2-3ffe76bf49cf_20260209_124050.mp4	\N	\N	1	t	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	2026-02-06 02:12:42.487345	2026-02-11 02:04:36.544097	\N	\N	57001508	\N	\N	\N	\N	\N	f
31a0a043-76f6-4fb3-92a3-bf06f7d56dfd	Canlı Ders -3	Bu bir canlı derstir. 	live_lesson	\N	\N	\N	6	f	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	2026-02-11 11:17:34.452044	2026-02-11 11:18:20.111561	\N	\N	\N	\N	\N	https://meet.google.com/wtz-kxio-ggz	2026-02-11 08:10:00+00	\N	t
\.


--
-- Data for Name: message_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.message_reports (id, message_id, reporter_id, reason, description, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, sender_role, content, attachment_url, attachment_filename, attachment_size, is_read, read_at, is_deleted, deleted_at, is_flagged, flag_reason, moderated_at, moderated_by_id, created_at, updated_at) FROM stdin;
2eeb8cb0-ef8e-42db-b0e2-47ee618ef2b3	66e24f7b-cfbb-46f5-a085-3a8b085103dc	9bb65634-56d3-489b-b405-a5948deec543	teacher	Merhabalr, bir problemim var	\N	\N	\N	t	2026-02-22 23:28:43.371866+00	f	\N	f	\N	\N	\N	2026-02-22 23:28:21.487556+00	2026-02-22 23:28:43.368003+00
35869b10-3fb0-4ba7-a1b6-9a372c1a9852	66e24f7b-cfbb-46f5-a085-3a8b085103dc	9bb65634-56d3-489b-b405-a5948deec543	teacher	Merhabalr, bir problemim var	\N	\N	\N	t	2026-02-22 23:28:43.371866+00	f	\N	f	\N	\N	\N	2026-02-22 23:27:01.026138+00	2026-02-22 23:28:43.368003+00
33b95d27-59be-4091-9ab8-b12bfcaaeef0	66e24f7b-cfbb-46f5-a085-3a8b085103dc	1dc668fb-5653-44b6-bc99-ba0df7820504	admin	Buyrun	\N	\N	\N	t	2026-02-22 23:29:03.445637+00	f	\N	f	\N	\N	\N	2026-02-22 23:28:45.11529+00	2026-02-22 23:29:03.443339+00
1daf590d-1535-49b1-9f27-59cfbf81c0a2	66e24f7b-cfbb-46f5-a085-3a8b085103dc	9bb65634-56d3-489b-b405-a5948deec543	teacher	Tst	\N	\N	\N	t	2026-02-22 23:30:33.383974+00	f	\N	f	\N	\N	\N	2026-02-22 23:30:26.003458+00	2026-02-22 23:30:33.380465+00
7365b05a-be8f-4d44-9b61-ae1f0fae484b	66e24f7b-cfbb-46f5-a085-3a8b085103dc	1dc668fb-5653-44b6-bc99-ba0df7820504	admin	Test	\N	\N	\N	t	2026-02-23 03:02:05.541894+00	f	\N	f	\N	\N	\N	2026-02-22 23:30:35.347628+00	2026-02-23 03:02:05.536822+00
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_preferences (id, user_id, preferences, email_enabled, push_enabled, in_app_enabled, quiet_hours_start, quiet_hours_end, created_at, updated_at) FROM stdin;
1280225a-c0bd-434f-8dac-c15f685be3c0	0732bf99-d96b-4b0c-9dae-a4ce916623b1	{}	t	t	t	\N	\N	2026-02-05 11:37:57.175784	2026-02-05 11:37:57.175784
2988fac5-9909-4821-9532-802158f6f885	51af4383-2b88-4de0-a073-4964625dbda1	{}	t	t	t	\N	\N	2026-02-05 11:37:57.175784	2026-02-05 11:37:57.175784
3f936f12-9877-43f7-87e2-3b2417e67717	54157c4d-9992-44aa-9a47-9bac2e5fbd88	{}	t	t	t	\N	\N	2026-02-05 11:37:57.175784	2026-02-05 11:37:57.175784
b8f16a20-40d0-48e9-a78d-6b504d9ef248	d0508689-b22e-4d2b-800b-615d115e98ee	{}	t	t	t	\N	\N	2026-02-05 11:37:57.175784	2026-02-05 11:37:57.175784
881cf2bb-76d8-439d-9426-dc1bb0c7bd1d	9bb65634-56d3-489b-b405-a5948deec543	{}	t	t	t	\N	\N	2026-02-05 11:41:03.459741	2026-02-05 11:41:03.459741
d52cf724-d098-402d-9d95-6994a775ea55	0e096750-b455-4cb8-b887-4ebc66fde107	{}	t	t	t	\N	\N	2026-02-05 11:41:03.459741	2026-02-05 11:41:03.459741
6f41eb10-8b31-4a37-878c-08b8a60af6c1	89ef4d93-9840-4400-85b8-5583d1739982	{}	t	t	t	\N	\N	2026-02-05 11:41:03.459741	2026-02-05 11:41:03.459741
565f800c-249c-4e72-9de5-5c4785cf9231	c1b0e9dc-f691-4728-be68-f7cf21d82198	{}	t	t	t	\N	\N	2026-02-05 11:41:03.459741	2026-02-05 11:41:03.459741
cfdf369f-6364-4f63-87da-b7807f3da91a	66e151fd-134f-4cfd-a4d9-0098b6af6001	{}	t	t	t	\N	\N	2026-02-05 11:41:03.459741	2026-02-05 11:41:03.459741
5e5f1ed0-3bff-48ac-9dd0-776e74a2c5cf	1dc668fb-5653-44b6-bc99-ba0df7820504	{}	t	t	t	\N	\N	2026-02-05 11:41:12.131943	2026-02-05 11:41:12.131943
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, sender_id, notification_type, title, message, data, is_read, read_at, delivery_channels, priority, expires_at, action_url, action_label, created_at, updated_at) FROM stdin;
12c83334-4bf0-4027-bafe-3dc7ff804668	0732bf99-d96b-4b0c-9dae-a4ce916623b1	1dc668fb-5653-44b6-bc99-ba0df7820504	system_announcement	TEST	TEST	{}	f	\N	["in_app"]	medium	\N			2026-02-05 11:37:57.175784	2026-02-05 11:37:57.175784
b95f65be-6b0a-4ae9-ab13-37353dbd4bf4	54157c4d-9992-44aa-9a47-9bac2e5fbd88	1dc668fb-5653-44b6-bc99-ba0df7820504	system_announcement	TEST	TEST	{}	f	\N	["in_app"]	medium	\N			2026-02-05 11:37:57.175784	2026-02-05 11:37:57.175784
343443a7-0aee-41bf-801a-3503af708627	d0508689-b22e-4d2b-800b-615d115e98ee	1dc668fb-5653-44b6-bc99-ba0df7820504	system_announcement	TEST	TEST	{}	f	\N	["in_app"]	medium	\N			2026-02-05 11:37:57.175784	2026-02-05 11:37:57.175784
db01b754-6169-4347-8ab1-c13e11377407	0e096750-b455-4cb8-b887-4ebc66fde107	1dc668fb-5653-44b6-bc99-ba0df7820504	admin_to_teacher	OGRETMENLER	DIKKAT DIKKAT DIKKAT	{}	f	\N	["in_app"]	urgent	\N			2026-02-05 11:41:03.459741	2026-02-05 11:41:03.459741
214da469-be4d-4177-af73-fef4f809800c	89ef4d93-9840-4400-85b8-5583d1739982	1dc668fb-5653-44b6-bc99-ba0df7820504	admin_to_teacher	OGRETMENLER	DIKKAT DIKKAT DIKKAT	{}	f	\N	["in_app"]	urgent	\N			2026-02-05 11:41:03.459741	2026-02-05 11:41:03.459741
7667c1ca-4fd4-46e8-b7fe-af837a06ce92	c1b0e9dc-f691-4728-be68-f7cf21d82198	1dc668fb-5653-44b6-bc99-ba0df7820504	admin_to_teacher	OGRETMENLER	DIKKAT DIKKAT DIKKAT	{}	f	\N	["in_app"]	urgent	\N			2026-02-05 11:41:03.459741	2026-02-05 11:41:03.459741
b47c94c4-ae9d-4812-9f76-a32d09c03579	66e151fd-134f-4cfd-a4d9-0098b6af6001	1dc668fb-5653-44b6-bc99-ba0df7820504	admin_to_teacher	OGRETMENLER	DIKKAT DIKKAT DIKKAT	{}	f	\N	["in_app"]	urgent	\N			2026-02-05 11:41:03.459741	2026-02-05 11:41:03.459741
6ce49cb5-3953-47b4-a912-5d9b335bd90d	9bb65634-56d3-489b-b405-a5948deec543	1dc668fb-5653-44b6-bc99-ba0df7820504	admin_to_teacher	OGRETMENLER	DIKKAT DIKKAT DIKKAT	{}	t	2026-02-05 11:41:23.868888	["in_app"]	urgent	\N			2026-02-05 11:41:03.459741	2026-02-05 11:41:23.849635
166909b7-5f98-438d-9f0f-3efa9636597c	0e096750-b455-4cb8-b887-4ebc66fde107	1dc668fb-5653-44b6-bc99-ba0df7820504	system_announcement	SED	SED	{}	f	\N	["in_app"]	urgent	\N			2026-02-05 11:43:34.768583	2026-02-05 11:43:34.768583
09ba215d-e10d-4b80-99f0-0087b0991e6e	89ef4d93-9840-4400-85b8-5583d1739982	1dc668fb-5653-44b6-bc99-ba0df7820504	system_announcement	SED	SED	{}	f	\N	["in_app"]	urgent	\N			2026-02-05 11:43:34.768583	2026-02-05 11:43:34.768583
6ac36035-0194-49c5-b3e0-f035b6a20b2a	c1b0e9dc-f691-4728-be68-f7cf21d82198	1dc668fb-5653-44b6-bc99-ba0df7820504	system_announcement	SED	SED	{}	f	\N	["in_app"]	urgent	\N			2026-02-05 11:43:34.768583	2026-02-05 11:43:34.768583
d4c9e8bc-d09f-4859-aca1-78afdfd4a18a	66e151fd-134f-4cfd-a4d9-0098b6af6001	1dc668fb-5653-44b6-bc99-ba0df7820504	system_announcement	SED	SED	{}	f	\N	["in_app"]	urgent	\N			2026-02-05 11:43:34.768583	2026-02-05 11:43:34.768583
96c940c9-4512-4aaa-b73b-49dabe4f1fd9	9bb65634-56d3-489b-b405-a5948deec543	1dc668fb-5653-44b6-bc99-ba0df7820504	system_announcement	SED	SED	{}	t	2026-02-05 11:44:06.271733	["in_app"]	urgent	\N			2026-02-05 11:43:34.768583	2026-02-05 11:44:06.267219
656d2814-b5cf-49b7-bc6b-553296769617	1dc668fb-5653-44b6-bc99-ba0df7820504	1dc668fb-5653-44b6-bc99-ba0df7820504	admin_to_teacher	OGRETMENLER	DIKKAT DIKKAT DIKKAT	{}	t	2026-02-05 19:37:14.633529	["in_app"]	urgent	\N			2026-02-05 11:41:12.131943	2026-02-05 19:37:14.625401
796e09bd-9832-4020-b493-c33d638a0a6c	9bb65634-56d3-489b-b405-a5948deec543	1dc668fb-5653-44b6-bc99-ba0df7820504	course_approved	Kursunuz Onaylandı: Test Kursu	'Test Kursu' adlı kursunuz admin tarafından onaylandı ve yayınlandı.	{"course_id": "def3437c-27ee-4775-a2a4-a40bfec1012a", "course_title": "Test Kursu", "course_slug": "test-kursu-v3", "status": "published", "admin_note": null}	f	\N	["in_app"]	medium	\N	/dashboard/my-courses/def3437c-27ee-4775-a2a4-a40bfec1012a	Kursu Görüntüle	2026-02-05 20:54:17.382771	2026-02-05 20:54:17.382771
45e22138-87ad-4078-8887-363b72273b56	51af4383-2b88-4de0-a073-4964625dbda1	9bb65634-56d3-489b-b405-a5948deec543	course_announcement	Arkadaşlar dikkatle dinleyelim dersi	Arkadaşlar dikkatle dinleyelim dersi	{"course_id": "e6f02d9f-ffdf-4fda-b646-fb6958ac5280"}	t	2026-02-06 01:30:22.378031	["in_app"]	medium	\N	/dashboard/courses/e6f02d9f-ffdf-4fda-b646-fb6958ac5280	Kursa git	2026-02-05 11:48:17.3411	2026-02-06 01:30:22.375215
b30c731e-512e-4e59-95bd-5ccba51f74b2	51af4383-2b88-4de0-a073-4964625dbda1	1dc668fb-5653-44b6-bc99-ba0df7820504	system_announcement	TEST	TEST	{}	t	2026-02-06 01:30:22.378021	["in_app"]	medium	\N			2026-02-05 11:37:57.175784	2026-02-06 01:30:22.375215
e433b5d1-6618-4a1b-8d4e-5314d1ff8078	51af4383-2b88-4de0-a073-4964625dbda1	9bb65634-56d3-489b-b405-a5948deec543	live_lesson_reminder	Canlı Ders 2	Dersinmiz yarın 	{"course_id": "e6f02d9f-ffdf-4fda-b646-fb6958ac5280", "course_title": "Matematik - Temel Seviye", "course_slug": "matematik-temel-seviye", "live_at": "2026-02-05T15:15", "live_url": "https://meet.google.com/wtz-kxio-ggz"}	t	2026-02-06 01:30:22.378034	["in_app"]	medium	\N	https://meet.google.com/wtz-kxio-ggz	Canlı derse git	2026-02-05 12:12:03.021253	2026-02-06 01:30:22.375215
0c9b38a3-9314-4067-aa60-2399eaf6c85f	9bb65634-56d3-489b-b405-a5948deec543	9bb65634-56d3-489b-b405-a5948deec543	course_submitted	Kursunuz Onaya Gönderildi: Ücretsiz Kurs	'Ücretsiz Kurs' adlı kursunuz onay için gönderildi. Admin incelemesi tamamlandığında bilgilendirileceksiniz.	{"course_id": "20368b4c-1103-4f33-9ccb-c8b9fbb3acc4", "course_title": "\\u00dccretsiz Kurs", "course_slug": "ucretsiz-kurs", "status": "pending_review", "is_resubmission": false}	f	\N	["in_app"]	medium	\N	/dashboard/my-courses/20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	Kursu Görüntüle	2026-02-06 02:13:09.350731	2026-02-06 02:13:09.350731
e26c27f8-174a-4cc9-ae25-2ffd89161e31	9bb65634-56d3-489b-b405-a5948deec543	1dc668fb-5653-44b6-bc99-ba0df7820504	course_approved	Kursunuz Onaylandı: Ücretsiz Kurs	'Ücretsiz Kurs' adlı kursunuz admin tarafından onaylandı ve yayınlandı.	{"course_id": "20368b4c-1103-4f33-9ccb-c8b9fbb3acc4", "course_title": "\\u00dccretsiz Kurs", "course_slug": "ucretsiz-kurs", "status": "published", "admin_note": null}	f	\N	["in_app"]	medium	\N	/dashboard/my-courses/20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	Kursu Görüntüle	2026-02-06 02:13:29.147875	2026-02-06 02:13:29.147875
659f21e4-40c0-4c24-95d4-0138d67b3f32	51af4383-2b88-4de0-a073-4964625dbda1	9bb65634-56d3-489b-b405-a5948deec543	teacher_reply	Eğitmeniniz Yorumunuza Cevap Verdi	"Matematik - Temel Seviye" kursuna yaptığınız yoruma eğitmen cevap verdi.	{}	t	2026-02-11 11:06:09.125799	["email", "in_app"]	medium	\N	/courses/matematik-temel-seviye	Yorumu Görüntüle	2026-02-07 13:36:31.504769	2026-02-11 11:06:09.118948
faa93de9-0836-4107-81fc-e43328a24abc	51af4383-2b88-4de0-a073-4964625dbda1	9bb65634-56d3-489b-b405-a5948deec543	live_lesson_reminder	Yeni Canlı Ders: Canlı Test Dersi	Ücretsiz Kurs kursunda yeni bir canlı ders planlandı. Tarih: 09.02.2026 12:12 UTC	{"course_id": "20368b4c-1103-4f33-9ccb-c8b9fbb3acc4", "lesson_id": "23ed7acd-b060-487a-93ad-5a560cc5ca9d", "live_lesson_at": "2026-02-09T12:12:00+00:00", "live_lesson_url": "https://meet.google.com/wtz-kxio-ggz"}	t	2026-02-11 11:06:09.125807	["email", "in_app"]	high	\N	/courses/ucretsiz-kurs	Kursa Git	2026-02-09 03:04:58.226796	2026-02-11 11:06:09.118948
fc4cc516-38ff-41d8-95a2-53bf8176effc	9bb65634-56d3-489b-b405-a5948deec543	9bb65634-56d3-489b-b405-a5948deec543	course_submitted	Kursunuz Onaya Gönderildi: Uzay Hocam	'Uzay Hocam' adlı kursunuz onay için gönderildi. Admin incelemesi tamamlandığında bilgilendirileceksiniz.	{"course_id": "c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7", "course_title": "Uzay Hocam", "course_slug": "uzay-hocam2", "status": "pending_review", "is_resubmission": false}	f	\N	["in_app"]	medium	\N	/dashboard/my-courses/c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7	Kursu Görüntüle	2026-02-11 11:09:43.545261	2026-02-11 11:09:43.545261
73bd9a89-dc0b-4d61-a820-e52ad81b9cec	9bb65634-56d3-489b-b405-a5948deec543	1dc668fb-5653-44b6-bc99-ba0df7820504	course_approved	Kursunuz Onaylandı: Uzay Hocam	'Uzay Hocam' adlı kursunuz admin tarafından onaylandı ve yayınlandı.	{"course_id": "c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7", "course_title": "Uzay Hocam", "course_slug": "uzay-hocam2", "status": "published", "admin_note": null}	f	\N	["in_app"]	medium	\N	/dashboard/my-courses/c078dd0b-49c1-4cc1-af3c-d4ba3dd914d7	Kursu Görüntüle	2026-02-11 11:10:28.738297	2026-02-11 11:10:28.738297
64c03272-5109-4a78-b72e-5706de6b8382	51af4383-2b88-4de0-a073-4964625dbda1	1dc668fb-5653-44b6-bc99-ba0df7820504	review_approved	Yorumunuz Onaylandı	"Ücretsiz Kurs" kursuna yaptığınız yorum onaylandı.	{}	f	\N	["email", "in_app"]	medium	\N	/courses/ucretsiz-kurs	Kursu Görüntüle	2026-02-11 11:10:44.154044	2026-02-11 11:10:44.154044
ef239f57-3329-47ac-a1d3-08d8d8fbe4f0	51af4383-2b88-4de0-a073-4964625dbda1	9bb65634-56d3-489b-b405-a5948deec543	live_lesson_reminder	Yeni Canlı Ders: Canlı Ders -3	Ücretsiz Kurs kursunda yeni bir canlı ders planlandı. Tarih: 11.02.2026 14:20 UTC	{"course_id": "20368b4c-1103-4f33-9ccb-c8b9fbb3acc4", "lesson_id": "31a0a043-76f6-4fb3-92a3-bf06f7d56dfd", "live_lesson_at": "2026-02-11T14:20:00+00:00", "live_lesson_url": "https://meet.google.com/wtz-kxio-ggz"}	f	\N	["email", "in_app"]	high	\N	/courses/ucretsiz-kurs	Kursa Git	2026-02-11 11:17:34.452044	2026-02-11 11:17:34.452044
85a3f540-a3c4-408c-bdad-0ed119f5a3cc	51af4383-2b88-4de0-a073-4964625dbda1	9bb65634-56d3-489b-b405-a5948deec543	live_lesson_reminder	Canlı Ders Yeniden Zamanlandı: Canlı Ders -3	Ücretsiz Kurs kursundaki canlı ders yeniden zamanlandı. Tarih: 11.02.2026 11:20 → 11.02.2026 11:10 UTC	{"course_id": "20368b4c-1103-4f33-9ccb-c8b9fbb3acc4", "lesson_id": "31a0a043-76f6-4fb3-92a3-bf06f7d56dfd", "live_lesson_at": "2026-02-11T11:10:00+00:00", "live_lesson_url": "https://meet.google.com/wtz-kxio-ggz"}	f	\N	["email", "in_app"]	high	\N	/courses/ucretsiz-kurs	Kursa Git	2026-02-11 11:18:12.891396	2026-02-11 11:18:12.891396
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, course_id, price, discount_price, final_price, platform_commission_rate, platform_commission, teacher_earnings, created_at) FROM stdin;
c122eaa0-73d5-44b5-992f-5d3c7dccfe0b	9e356b09-1b1e-4a71-8914-7443b89dad09	def3437c-27ee-4775-a2a4-a40bfec1012a	55.00	\N	55.00	0.35	19.25	35.75	2026-02-06 02:03:30.544936
92df5e35-2b51-4e65-8cdf-f567fcd1e159	7982a7bb-a651-4b06-bae2-3bc12ccf28d8	def3437c-27ee-4775-a2a4-a40bfec1012a	55.00	\N	55.00	0.35	19.25	35.75	2026-02-06 02:07:11.027646
35022635-92b2-440a-af82-e8157152b2db	f0ddd39f-f42d-4e9f-9d7b-e0c9d81e9f3c	def3437c-27ee-4775-a2a4-a40bfec1012a	55.00	\N	55.00	0.35	19.25	35.75	2026-02-06 02:08:45.744838
3f6073dd-457e-4194-aa1c-022b15e226a9	b60567fb-62fd-4a00-a603-60770a933aaa	20368b4c-1103-4f33-9ccb-c8b9fbb3acc4	0.00	\N	0.00	0.35	0.00	0.00	2026-02-06 02:14:20.890408
59de2d76-2b6e-498b-8476-dc09c43a8df0	7964bda6-640f-4c0c-8421-3d8939d091fc	eeb69cbd-d481-434e-b487-b628fea37c96	279.00	199.00	199.00	0.35	69.65	129.35	2026-02-11 11:00:00.44619
91ab4df6-1363-4846-a9da-9590d0cc8ef6	277c0161-8620-46a6-afb4-6ca73e7b4950	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	399.00	\N	399.00	0.35	139.65	259.35	2026-02-23 00:15:00.161865
23a2b507-7319-404d-bfad-c0e773e6cb08	a11b6616-346b-42d4-956c-3d4f99f1b896	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	299.00	199.00	199.00	0.35	69.65	129.35	2026-02-23 00:20:11.234741
437d5af6-59af-4067-b075-92582b9602a5	e6e728f8-eacb-4eed-8a0d-077aff2f0a13	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	299.00	199.00	199.00	0.35	69.65	129.35	2026-02-23 03:01:59.564369
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, user_id, subtotal, discount_amount, total, status, payment_method, payment_gateway_transaction_id, payment_gateway_response, notes, created_at, updated_at, paid_at) FROM stdin;
b60567fb-62fd-4a00-a603-60770a933aaa	ORD-20260206-A33D939F	51af4383-2b88-4de0-a073-4964625dbda1	0.00	0.00	0.00	paid	credit_card	\N	\N	\N	2026-02-06 02:14:20.890408	2026-02-06 02:14:20.906085	2026-02-06 05:14:20.905108
f0ddd39f-f42d-4e9f-9d7b-e0c9d81e9f3c	ORD-20260206-B6136A9F	51af4383-2b88-4de0-a073-4964625dbda1	55.00	0.00	55.00	paid	credit_card	\N	\N	\N	2026-02-06 02:08:45.744838	2026-02-06 02:17:30.609348	2026-02-06 05:17:30.617677
7982a7bb-a651-4b06-bae2-3bc12ccf28d8	ORD-20260206-AF87B0D3	51af4383-2b88-4de0-a073-4964625dbda1	55.00	0.00	55.00	cancelled	credit_card	\N	\N	\N	2026-02-06 02:07:11.027646	2026-02-06 08:29:48.237557	\N
9e356b09-1b1e-4a71-8914-7443b89dad09	ORD-20260206-FC8C8ADF	51af4383-2b88-4de0-a073-4964625dbda1	55.00	0.00	55.00	paid	credit_card	\N	\N	\N	2026-02-06 02:03:30.544936	2026-02-06 20:32:40.45177	2026-02-06 23:32:40.466855
7964bda6-640f-4c0c-8421-3d8939d091fc	ORD-20260211-56CA721F	51af4383-2b88-4de0-a073-4964625dbda1	199.00	0.00	199.00	paid	credit_card	\N	\N	\N	2026-02-11 11:00:00.44619	2026-02-11 11:12:28.915837	2026-02-11 14:12:28.928641
e6e728f8-eacb-4eed-8a0d-077aff2f0a13	ORD-20260223-E8F1C978	9bb65634-56d3-489b-b405-a5948deec543	199.00	0.00	199.00	paid	credit_card	\N	\N	\N	2026-02-23 03:01:59.564369	2026-02-23 03:30:45.751677	2026-02-23 06:30:45.772014
a11b6616-346b-42d4-956c-3d4f99f1b896	ORD-20260223-7FF4DDA7	1dc668fb-5653-44b6-bc99-ba0df7820504	199.00	0.00	199.00	paid	credit_card	\N	\N	\N	2026-02-23 00:20:11.234741	2026-02-23 03:30:47.20181	2026-02-23 06:30:47.211865
277c0161-8620-46a6-afb4-6ca73e7b4950	ORD-20260223-69A024F1	1dc668fb-5653-44b6-bc99-ba0df7820504	399.00	0.00	399.00	paid	credit_card	\N	\N	\N	2026-02-23 00:15:00.161865	2026-02-23 03:30:48.500581	2026-02-23 06:30:48.514413
\.


--
-- Data for Name: popup_announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.popup_announcements (id, title, message, popup_type, is_active, starts_at, expires_at, target_audience, priority, is_dismissible, show_once_per_user, dismiss_duration_days, image_url, button_text, button_link_url, button_link_target, width, height, "position", overlay_opacity, created_by_id, created_at, updated_at) FROM stdin;
e5fa4a40-ada9-4d7e-a918-e691fab7735f	Promosyon Test	Promosyon Test	promotion	t	\N	\N	all	0	t	f	\N	\N	Tıkla Git	https://bihocam.com/	_self	500	\N	center	0.50	1dc668fb-5653-44b6-bc99-ba0df7820504	2026-02-19 10:51:44.195589	2026-02-19 10:51:44.195589
\.


--
-- Data for Name: quiz_attempt_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempt_answers (id, attempt_id, question_id, answer_text, is_correct, points_earned, answered_at) FROM stdin;
e5ff13bf-9f09-4aeb-93b0-e5cf2808583a	f957caa1-8f53-4e7a-bfc1-d2105c643361	121eedad-4c57-4c8b-8df3-3df5f66807b6	a	t	15	2026-02-09 06:04:30.414497
3223f26e-74ed-4043-99d9-ce40bdcdb8be	ce3c3144-863d-4f56-ba4e-7279b2868b63	121eedad-4c57-4c8b-8df3-3df5f66807b6	a	t	15	2026-02-11 11:05:22.274783
43ad4544-74e3-4290-a4f7-86677c3fde9e	ce3c3144-863d-4f56-ba4e-7279b2868b63	24441c1f-8783-49fa-8ef7-8fb8c9124d1f	b	f	0	2026-02-11 11:05:22.274783
685774e2-3b72-42e4-bcca-b9037727e61e	8831a6f7-e6e3-450d-9377-20f1ed0f0738	121eedad-4c57-4c8b-8df3-3df5f66807b6	a	f	0	2026-02-09 04:23:09.781155
22dc438e-9a2a-4263-ac18-eea74bfdc3d8	8831a6f7-e6e3-450d-9377-20f1ed0f0738	121eedad-4c57-4c8b-8df3-3df5f66807b6	a	t	15	2026-02-09 04:23:12.719831
\.


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempts (id, quiz_id, user_id, status, total_questions, correct_answers, score_percentage, points_earned, total_points, started_at, completed_at, time_taken_seconds, created_at, updated_at) FROM stdin;
8831a6f7-e6e3-450d-9377-20f1ed0f0738	16630183-f607-41d3-8fea-c3715af922e1	51af4383-2b88-4de0-a073-4964625dbda1	completed	1	1	100	15	15	2026-02-09 04:16:26.169292+00	2026-02-09 04:23:12.734616+00	406	2026-02-09 04:16:26.162822	2026-02-09 04:23:12.719831
f957caa1-8f53-4e7a-bfc1-d2105c643361	16630183-f607-41d3-8fea-c3715af922e1	51af4383-2b88-4de0-a073-4964625dbda1	completed	1	1	100	15	15	2026-02-09 04:15:06.634563+00	2026-02-09 06:04:30.428782+00	6563	2026-02-09 04:15:06.620668	2026-02-09 06:04:30.414497
ce3c3144-863d-4f56-ba4e-7279b2868b63	16630183-f607-41d3-8fea-c3715af922e1	51af4383-2b88-4de0-a073-4964625dbda1	completed	1	1	100	15	15	2026-02-09 09:50:40.56045+00	2026-02-11 11:05:22.29673+00	177281	2026-02-09 09:50:40.556559	2026-02-11 11:05:22.274783
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_questions (id, quiz_id, question_type, question_text, options, correct_answer, points, "order", explanation, created_at, updated_at) FROM stdin;
121eedad-4c57-4c8b-8df3-3df5f66807b6	16630183-f607-41d3-8fea-c3715af922e1	multiple_choice	Test Sorusudur	{"a": "Deneme1", "b": "Deneme2", "c": "Deneme3", "d": "Deneme4"}	a	15	1		2026-02-09 04:07:32.320092	2026-02-09 04:07:32.320092
7b8eb004-147c-431a-a754-79374240dc06	7fd5b1e1-079a-4d54-9bac-b0b6ce176a88	multiple_choice	Merhaba Nasılsın?	{"a": "A", "b": "B", "c": "C", "d": "D"}	a	1	1		2026-02-09 09:28:42.344868	2026-02-09 09:28:42.344868
24441c1f-8783-49fa-8ef7-8fb8c9124d1f	16630183-f607-41d3-8fea-c3715af922e1	multiple_choice	Soru2	{"a": "A", "b": "B", "c": "C", "d": "D"}	a	15	2		2026-02-09 09:51:42.191448	2026-02-09 09:51:42.191448
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quizzes (id, lesson_id, title, description, passing_score, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers, created_at, updated_at) FROM stdin;
16630183-f607-41d3-8fea-c3715af922e1	ddf8fef6-4d09-4cc6-b179-97e95bbf0d8a	QuizDeneme	QuizDeneme	70	\N	\N	t	f	2026-02-09 04:02:34.888569	2026-02-09 04:15:49.897397
7fd5b1e1-079a-4d54-9bac-b0b6ce176a88	9f50d8cc-c305-4e18-9efc-307e79ff9c3f	Test3	Test3	70	\N	\N	f	t	2026-02-09 09:28:19.319341	2026-02-09 09:28:19.319341
\.


--
-- Data for Name: site_announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_announcements (id, title, message, type, is_active, starts_at, expires_at, target_audience, priority, is_dismissible, created_at, updated_at) FROM stdin;
d2668090-9e83-42f5-a823-80b644391452	Test	Test	info	f	\N	\N	all	100	t	2026-02-08 22:37:02.355859	2026-02-08 22:40:26.185035
bfa2e1c4-dcd6-4b7e-b63c-f1ae9cb48496	TEST TEST	TEST TEST TEST TEST 	info	f	\N	\N	all	0	t	2026-02-08 22:40:38.328277	2026-02-08 23:11:16.349652
66920dfa-1630-4af5-9821-a4d8bfe7ecd9	UZAY HOCAM	UZAY HOCAM	maintenance	f	\N	\N	all	0	t	2026-02-09 09:59:37.476786	2026-02-09 09:59:56.396967
ab94da04-3592-4321-bbdd-2202af8e262a	MERHABA ALİ HOCAM	MERHABA ALİ HOCAM	maintenance	t	\N	\N	all	0	t	2026-02-11 11:13:32.368463	2026-02-11 11:13:32.368463
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, general, smtp, seo, custom_code, created_at, updated_at, platform) FROM stdin;
9	{}	{"host": "smtp.yandex.com", "port": 587, "username": "astchart@summarify.io", "password_encrypted": "Emre12345.", "use_tls": true, "use_ssl": false, "from_email": "astchart@summarify.io"}	{}	{"email_custom_segments": [{"id": "152c4587-c510-408a-bd6f-51b4b65c84a2", "name": "Test", "description": "Test", "user_ids": ["54157c4d-9992-44aa-9a47-9bac2e5fbd88", "0732bf99-d96b-4b0c-9dae-a4ce916623b1", "51af4383-2b88-4de0-a073-4964625dbda1"], "created_at": "2026-02-06T12:24:59.906501", "updated_at": "2026-02-06T12:24:59.906501"}, {"id": "03e15191-e43d-4d40-b6cb-1938388e9eff", "name": "TestlerinTesti", "description": "TestlerinTesti", "user_ids": ["d0508689-b22e-4d2b-800b-615d115e98ee", "54157c4d-9992-44aa-9a47-9bac2e5fbd88", "0732bf99-d96b-4b0c-9dae-a4ce916623b1", "51af4383-2b88-4de0-a073-4964625dbda1"], "created_at": "2026-02-06T14:09:06.985061", "updated_at": "2026-02-06T14:09:06.985061"}], "email_custom_templates": [{"id": "0db74ea5-ed68-4656-a02a-a98856244c2f", "name": "Starter CRM - Momentum", "subject": "Sana ozel yeni firsatlar var, {{ full_name }}", "html_body": "<div style=\\"background:#f6efe6;padding:28px;font-family:Georgia,'Times New Roman',serif;color:#1f2937;\\">\\n  <div style=\\"max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadfd1;border-radius:16px;overflow:hidden;box-shadow:0 18px 35px rgba(20,16,12,.12)\\">\\n    <div style=\\"padding:30px;background:linear-gradient(135deg,#0f766e 0%,#14532d 100%);color:#fff;position:relative;\\">\\n      <div style=\\"position:absolute;right:-24px;top:-24px;width:120px;height:120px;border-radius:999px;background:rgba(255,255,255,.13);\\"></div>\\n      <div style=\\"font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.8\\">BiHocam CRM</div>\\n      <h1 style=\\"margin:12px 0 0 0;font-size:34px;line-height:1.05;\\">{{ offer_title }}</h1>\\n      <p style=\\"margin:12px 0 0 0;font-size:15px;opacity:.92\\">Merhaba {{ full_name }}, senin icin secilen firsatlar burada.</p>\\n    </div>\\n    <div style=\\"padding:26px;\\">\\n      <p style=\\"font-size:16px;line-height:1.65;margin:0 0 16px 0;\\">Bu kampanyaya <strong style=\\"color:#b45309\\">{{ offer_deadline }}</strong> tarihine kadar ulasabilirsin.</p>\\n      <div style=\\"margin:18px 0;padding:14px 16px;border:1px dashed #fb923c;background:#fff7ed;border-radius:12px;\\">\\n        <div style=\\"font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9a3412;\\">Kampanya Kodu</div>\\n        <div style=\\"font-size:24px;font-weight:700;color:#7c2d12;margin-top:4px;\\">{{ coupon_code }}</div>\\n      </div>\\n      <a href=\\"{{ cta_url }}\\" style=\\"display:inline-block;margin-top:6px;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;\\">Firsati Incele</a>\\n    </div>\\n    <div style=\\"padding:16px 26px;border-top:1px solid #f1e7da;background:#fffbf6;font-size:12px;color:#6b7280;\\">\\n      Bu e-postayi almak istemiyorsan bildirim ayarlarini guncelleyebilirsin.\\n    </div>\\n  </div>\\n</div>", "plain_body": "Merhaba {{ full_name }}, {{ offer_title }} kampanyasi aktif. Son tarih: {{ offer_deadline }}. Kupon: {{ coupon_code }}. Detay: {{ cta_url }}", "description": "Kurs lansmani, duyuru ve teklif kampanyalari icin modern baslangic sablonu.", "variables": ["full_name", "email", "offer_title", "offer_deadline", "cta_url", "coupon_code"], "created_at": "2026-02-06T12:25:08.383822", "updated_at": "2026-02-06T12:25:08.383822"}], "live_chat_js": ""}	2026-02-06 12:04:52.607349	2026-02-22 23:42:40.395535	{"maintenance_mode": false}
\.


--
-- Data for Name: storage_quotas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storage_quotas (id, user_id, quota_bytes, used_bytes, reset_at, reset_period_days, is_custom, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: teacher_bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_bank_accounts (id, teacher_id, bank_name, iban, account_holder_name, is_default, status, review_note, created_at, approved_at, rejected_at) FROM stdin;
e844bd48-a09b-4a28-9493-c1698de29b69	9bb65634-56d3-489b-b405-a5948deec543	Test	TR220006200147500006671012	Testtt	f	approved	\N	2026-02-06 00:54:46.277986	2026-02-06 01:04:48.490626	\N
\.


--
-- Data for Name: teacher_earnings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_earnings (id, teacher_id, course_id, order_id, withdrawal_request_id, amount, currency, gross_amount, commission_rate, commission_amount, type, description, reference_id, created_at, ad_campaign_id) FROM stdin;
6c0b952d-6fe1-418f-9bc0-25bdd8b23d09	9bb65634-56d3-489b-b405-a5948deec543	def3437c-27ee-4775-a2a4-a40bfec1012a	9e356b09-1b1e-4a71-8914-7443b89dad09	\N	35.75	TRY	55.00	0.35	19.25	earning	Sipariş geliri: ORD-20260206-FC8C8ADF	order:9e356b09-1b1e-4a71-8914-7443b89dad09:course:def3437c-27ee-4775-a2a4-a40bfec1012a	2026-02-06 20:32:40.45177	\N
e2fa0640-30ad-4537-b7a4-957da30b51d9	89ef4d93-9840-4400-85b8-5583d1739982	eeb69cbd-d481-434e-b487-b628fea37c96	7964bda6-640f-4c0c-8421-3d8939d091fc	\N	129.35	TRY	199.00	0.35	69.65	earning	Sipariş geliri: ORD-20260211-56CA721F	order:7964bda6-640f-4c0c-8421-3d8939d091fc:course:eeb69cbd-d481-434e-b487-b628fea37c96	2026-02-11 11:12:28.915837	\N
40dad8c5-3127-4123-b22a-07caadc18f17	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	5000.00	TRY	\N	\N	\N	adjustment	Admin düzeltmesi: Reklam kampanyası için ek bakiye (Admin: BiHocam Admin)	\N	2026-02-19 13:23:47.942707	\N
8102ceb7-c7ed-4143-afd6-69701e30ad05	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	-300.00	TRY	\N	\N	\N	ad_spend	Reklam kampanyası: Test (Onaylandı)	d4299b40-f8e0-41b3-871d-8ac0b521318e	2026-02-19 13:37:16.562786	d4299b40-f8e0-41b3-871d-8ac0b521318e
2924c2b1-74e5-44cd-858a-cfbf9a75902e	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	-50.00	TRY	\N	\N	\N	ad_spend	Reklam kampanyası: TEST (Onaylandı)	25c25a02-3123-44f0-9c94-7af02dc6bcff	2026-02-19 14:12:58.859372	25c25a02-3123-44f0-9c94-7af02dc6bcff
1df752bf-736c-45e7-8c4a-62054e97a6ec	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	-120.00	TRY	\N	\N	\N	ad_spend	Reklam kampanyası: TEST2 (Onaylandı)	4222c22d-6c69-432c-b2ce-57d3f84f66e9	2026-02-19 14:12:32.542413	4222c22d-6c69-432c-b2ce-57d3f84f66e9
8481b732-c819-4085-803e-f9909db3975f	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	-100.00	TRY	\N	\N	\N	ad_spend	Reklam kampanyası: TEST2 (Onaylandı)	28a994bf-d5ea-4a82-a792-bb4bdc8fff90	2026-02-19 14:12:07.633379	28a994bf-d5ea-4a82-a792-bb4bdc8fff90
0553c948-8425-4c00-bc0a-be8d986017f8	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	-160.00	TRY	\N	\N	\N	ad_spend	Reklam kampanyası: TEST (Onaylandı)	60a22a8e-4f63-459f-ba3a-243839b27f5f	2026-02-19 14:16:19.184194	\N
6c584bbb-629d-49cc-a909-1736f548d3aa	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	80.00	TRY	\N	\N	\N	adjustment	Reklam kampanyası iptali: TEST (İade)	60a22a8e-4f63-459f-ba3a-243839b27f5f	2026-02-19 14:40:18.839111	\N
7a9cc08b-d9c7-4ff5-a439-cbb3ba60b44c	9bb65634-56d3-489b-b405-a5948deec543	\N	\N	\N	-80.00	TRY	\N	\N	\N	ad_spend	Reklam kampanyası: Uazay (Onaylandı)	f94a5a47-bd36-4899-ba88-cec6708d9cb4	2026-02-19 14:42:30.840903	f94a5a47-bd36-4899-ba88-cec6708d9cb4
a471ab58-4c46-4ff5-803e-e6fb0d70f3f5	9bb65634-56d3-489b-b405-a5948deec543	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	e6e728f8-eacb-4eed-8a0d-077aff2f0a13	\N	129.35	TRY	199.00	0.35	69.65	earning	Sipariş geliri: ORD-20260223-E8F1C978	order:e6e728f8-eacb-4eed-8a0d-077aff2f0a13:course:e6f02d9f-ffdf-4fda-b646-fb6958ac5280	2026-02-23 03:30:45.751677	\N
41b982c0-67ba-4e30-9ca8-96bc64af0677	9bb65634-56d3-489b-b405-a5948deec543	e6f02d9f-ffdf-4fda-b646-fb6958ac5280	a11b6616-346b-42d4-956c-3d4f99f1b896	\N	129.35	TRY	199.00	0.35	69.65	earning	Sipariş geliri: ORD-20260223-7FF4DDA7	order:a11b6616-346b-42d4-956c-3d4f99f1b896:course:e6f02d9f-ffdf-4fda-b646-fb6958ac5280	2026-02-23 03:30:47.20181	\N
6b70bbd9-e107-4e1b-9c51-d73e9bdacbf6	0e096750-b455-4cb8-b887-4ebc66fde107	bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	277c0161-8620-46a6-afb4-6ca73e7b4950	\N	259.35	TRY	399.00	0.35	139.65	earning	Sipariş geliri: ORD-20260223-69A024F1	order:277c0161-8620-46a6-afb4-6ca73e7b4950:course:bc4a00ae-540a-4af7-b1b2-4c7f966c7ccb	2026-02-23 03:30:48.500581	\N
\.


--
-- Data for Name: user_blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_blocks (id, blocker_id, blocked_id, reason, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, hashed_password, full_name, role, is_active, is_verified, organization_id, created_at, updated_at, phone, last_login_at, bio, expertise_tags, social_links, avatar_url) FROM stdin;
0732bf99-d96b-4b0c-9dae-a4ce916623b1	direct3@test.com	$2b$12$rT8I3Br/Bh1gXopog3OMnO70BkdM/49zLthKeffiT20RNpZFvVD7a	Direct Test	student	t	f	\N	2026-01-23 00:43:24.834521	2026-01-23 00:43:24.834521	\N	\N	\N	\N	\N	\N
0e096750-b455-4cb8-b887-4ebc66fde107	ayse.demir@bihocam.com	$2b$12$v.alvhcqlyJgsdxuXPCvvuWqYtSb.EY9lDdFE8GeponLrhf93ql/C	Ayşe Demir	teacher	t	t	\N	2026-01-23 01:16:27.352885	2026-01-23 01:16:27.352885	\N	\N	\N	\N	\N	\N
c1b0e9dc-f691-4728-be68-f7cf21d82198	fatma.oz@bihocam.com	$2b$12$2LE/JEGL4zzdRZ1cj8NYg.DRps.4m.FzcY1eY6ByAJj7q3e0qoOoa	Fatma Öz	teacher	t	t	\N	2026-01-23 01:16:27.352885	2026-01-23 01:16:27.352885	\N	\N	\N	\N	\N	\N
54157c4d-9992-44aa-9a47-9bac2e5fbd88	ogrenci2@bihocam.com	$2b$12$3uXpLKbq8N37sokHx771OOPDFT1d480kqtxkOtnJb9p8yOWFo/ZHe	Zeynep Yıldız	student	t	t	\N	2026-01-23 01:16:27.352885	2026-01-23 01:16:27.352885	\N	\N	\N	\N	\N	\N
66e151fd-134f-4cfd-a4d9-0098b6af6001	emre@test.com	$2b$12$a58GYk7tG/OrkBpFkWbd.Oy6fC.rzHcFFu87ZojOjFDYRKIxuJTdC	Emre	teacher	t	f	\N	2026-01-23 01:25:28.04419	2026-01-23 01:25:28.04419	\N	\N	\N	\N	\N	\N
1dc668fb-5653-44b6-bc99-ba0df7820504	admin@bihocam.com	$2b$12$gnlOdcY3lj05uuZCnc3Cou8c0HntA94x7h/ICgnnGSqSFHhgWVyw6	BiHocam Admin	admin	t	t	\N	2026-01-23 16:57:01.402614	2026-01-23 16:57:01.402614	\N	\N	\N	\N	\N	\N
d0508689-b22e-4d2b-800b-615d115e98ee	ali@test.com	$2b$12$D2588hTS6AZapP9SCwJZeOPkABz3iCnF63B2Ye/LGj1oyYVppDeFC	Ali G	student	t	t	\N	2026-01-23 09:12:19.875092	2026-02-05 22:15:00.987973	\N	\N	\N	\N	\N	\N
89ef4d93-9840-4400-85b8-5583d1739982	mehmet.kaya@bihocam.com	$2b$12$.tMks07JsIDeiGuivnDKLemfGG0qhk2sChAh3PNoVVLdVu48dG8li	Mehmet Kaya	teacher	t	t	\N	2026-01-23 01:16:27.352885	2026-02-05 22:21:07.226241	\N	\N	\N	\N	\N	\N
9bb65634-56d3-489b-b405-a5948deec543	ahmet.yilmaz@bihocam.com	$2b$12$dbR2s2bCAOqk5Jm7W5isjesUVHYgoL5v0wljHb51/6b31WlfUJoUe	Ahmet Yılmaz	teacher	t	t	\N	2026-01-23 01:16:27.352885	2026-02-06 00:07:11.662706	\N	\N	\N	\N	{}	/api/v1/media/avatars/9bb65634-56d3-489b-b405-a5948deec543_20260206_030709.webp
51af4383-2b88-4de0-a073-4964625dbda1	ogrenci1@bihocam.com	$2b$12$1B6hr991mzfFWiTr5nN0euqD42Uhv7oLCOkIcXrY.wRf.iy7Yd3T.	Ali Veli A	student	t	t	\N	2026-01-23 01:16:27.352885	2026-02-09 03:11:22.480274		\N	\N	\N	\N	\N
\.


--
-- Data for Name: withdrawal_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.withdrawal_requests (id, teacher_id, bank_account_id, amount, currency, status, admin_note, requested_at, processed_at, paid_at) FROM stdin;
\.


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 9, true);


--
-- Name: ad_campaign_analytics ad_campaign_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaign_analytics
    ADD CONSTRAINT ad_campaign_analytics_pkey PRIMARY KEY (id);


--
-- Name: ad_campaigns ad_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_pkey PRIMARY KEY (id);


--
-- Name: ad_placements ad_placements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_placements
    ADD CONSTRAINT ad_placements_pkey PRIMARY KEY (id);


--
-- Name: ad_pricing ad_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_pricing
    ADD CONSTRAINT ad_pricing_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_post_categories blog_post_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_pkey PRIMARY KEY (post_id, category_id);


--
-- Name: blog_post_tags blog_post_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_tags
    ADD CONSTRAINT blog_post_tags_pkey PRIMARY KEY (post_id, tag_id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: blog_tags blog_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT blog_tags_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: certificate_templates certificate_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_templates
    ADD CONSTRAINT certificate_templates_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_certificate_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_number_key UNIQUE (certificate_number);


--
-- Name: certificates certificates_enrollment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_enrollment_id_key UNIQUE (enrollment_id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: content_audit_logs content_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_audit_logs
    ADD CONSTRAINT content_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: coupon_usages coupon_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: course_categories course_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_pkey PRIMARY KEY (course_id, category_id);


--
-- Name: course_review_history course_review_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_review_history
    ADD CONSTRAINT course_review_history_pkey PRIMARY KEY (id);


--
-- Name: course_reviews course_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: crm_audience_members crm_audience_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_audience_members
    ADD CONSTRAINT crm_audience_members_pkey PRIMARY KEY (id);


--
-- Name: crm_audiences crm_audiences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_audiences
    ADD CONSTRAINT crm_audiences_pkey PRIMARY KEY (id);


--
-- Name: crm_email_templates crm_email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_email_templates
    ADD CONSTRAINT crm_email_templates_pkey PRIMARY KEY (id);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: message_reports message_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reports
    ADD CONSTRAINT message_reports_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: popup_announcements popup_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.popup_announcements
    ADD CONSTRAINT popup_announcements_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempt_answers quiz_attempt_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_lesson_id_key UNIQUE (lesson_id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: site_announcements site_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_announcements
    ADD CONSTRAINT site_announcements_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: storage_quotas storage_quotas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storage_quotas
    ADD CONSTRAINT storage_quotas_pkey PRIMARY KEY (id);


--
-- Name: teacher_bank_accounts teacher_bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_bank_accounts
    ADD CONSTRAINT teacher_bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: teacher_earnings teacher_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_earnings
    ADD CONSTRAINT teacher_earnings_pkey PRIMARY KEY (id);


--
-- Name: cart_items unique_user_course_cart; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT unique_user_course_cart UNIQUE (user_id, course_id);


--
-- Name: enrollments unique_user_course_enrollment; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT unique_user_course_enrollment UNIQUE (user_id, course_id);


--
-- Name: course_reviews unique_user_course_review; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT unique_user_course_review UNIQUE (user_id, course_id);


--
-- Name: lesson_progress unique_user_lesson_progress; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT unique_user_lesson_progress UNIQUE (user_id, lesson_id);


--
-- Name: ad_campaign_analytics uq_campaign_analytics_date; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaign_analytics
    ADD CONSTRAINT uq_campaign_analytics_date UNIQUE (campaign_id, date);


--
-- Name: conversations uq_conversation_participants; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT uq_conversation_participants UNIQUE (participant1_id, participant2_id, course_id);


--
-- Name: crm_audience_members uq_crm_audience_members_audience_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_audience_members
    ADD CONSTRAINT uq_crm_audience_members_audience_user UNIQUE (audience_id, user_id);


--
-- Name: message_reports uq_message_report; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reports
    ADD CONSTRAINT uq_message_report UNIQUE (message_id, reporter_id);


--
-- Name: user_blocks uq_user_block; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT uq_user_block UNIQUE (blocker_id, blocked_id);


--
-- Name: user_blocks user_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_requests withdrawal_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (id);


--
-- Name: idx_analytics_campaign_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_campaign_date ON public.ad_campaign_analytics USING btree (campaign_id, date);


--
-- Name: idx_audit_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_created ON public.content_audit_logs USING btree (created_at);


--
-- Name: idx_audit_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_resource ON public.content_audit_logs USING btree (resource_type, resource_id);


--
-- Name: idx_audit_user_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_user_action ON public.content_audit_logs USING btree (user_id, action);


--
-- Name: idx_blog_category_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_category_order ON public.blog_categories USING btree ("order");


--
-- Name: idx_blog_category_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_category_parent ON public.blog_categories USING btree (parent_id);


--
-- Name: idx_blog_category_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_category_slug ON public.blog_categories USING btree (slug);


--
-- Name: idx_blog_post_author; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_post_author ON public.blog_posts USING btree (author_id);


--
-- Name: idx_blog_post_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_post_category ON public.blog_post_categories USING btree (post_id, category_id);


--
-- Name: idx_blog_post_created_at_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_post_created_at_desc ON public.blog_posts USING btree (created_at DESC);


--
-- Name: idx_blog_post_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_post_published_at ON public.blog_posts USING btree (published_at);


--
-- Name: idx_blog_post_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_post_slug ON public.blog_posts USING btree (slug);


--
-- Name: idx_blog_post_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_post_status ON public.blog_posts USING btree (status);


--
-- Name: idx_blog_post_tag; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_post_tag ON public.blog_post_tags USING btree (post_id, tag_id);


--
-- Name: idx_blog_tag_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_tag_name ON public.blog_tags USING btree (name);


--
-- Name: idx_blog_tag_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_tag_slug ON public.blog_tags USING btree (slug);


--
-- Name: idx_blog_tag_usage_count_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_tag_usage_count_desc ON public.blog_tags USING btree (usage_count DESC);


--
-- Name: idx_campaign_approval; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_approval ON public.ad_campaigns USING btree (approval_status);


--
-- Name: idx_campaign_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_dates ON public.ad_campaigns USING btree (start_date, end_date);


--
-- Name: idx_campaign_placement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_placement ON public.ad_campaigns USING btree (placement_id, status);


--
-- Name: idx_campaign_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_status ON public.ad_campaigns USING btree (status);


--
-- Name: idx_campaign_teacher; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_teacher ON public.ad_campaigns USING btree (teacher_id, status);


--
-- Name: idx_cert_template_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cert_template_active ON public.certificate_templates USING btree (is_active);


--
-- Name: idx_cert_template_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cert_template_course ON public.certificate_templates USING btree (course_id);


--
-- Name: idx_cert_template_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cert_template_created_by ON public.certificate_templates USING btree (created_by_id);


--
-- Name: idx_certificate_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_certificate_course ON public.certificates USING btree (course_id);


--
-- Name: idx_certificate_enrollment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_certificate_enrollment ON public.certificates USING btree (enrollment_id);


--
-- Name: idx_certificate_issued; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_certificate_issued ON public.certificates USING btree (issued_at);


--
-- Name: idx_certificate_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_certificate_number ON public.certificates USING btree (certificate_number);


--
-- Name: idx_certificate_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_certificate_user ON public.certificates USING btree (user_id);


--
-- Name: idx_conversation_last_message; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversation_last_message ON public.conversations USING btree (last_message_at);


--
-- Name: idx_conversation_participant1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversation_participant1 ON public.conversations USING btree (participant1_id);


--
-- Name: idx_conversation_participant2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversation_participant2 ON public.conversations USING btree (participant2_id);


--
-- Name: idx_conversation_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversation_type ON public.conversations USING btree (conversation_type);


--
-- Name: idx_coupon_auto_apply_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupon_auto_apply_priority ON public.coupons USING btree (auto_apply_priority);


--
-- Name: idx_coupon_auto_apply_trigger; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupon_auto_apply_trigger ON public.coupons USING btree (is_auto_apply, trigger_type);


--
-- Name: idx_coupon_target_courses; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupon_target_courses ON public.coupons USING gin (target_course_ids);


--
-- Name: idx_course_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_category ON public.course_categories USING btree (course_id, category_id);


--
-- Name: idx_message_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_conversation ON public.messages USING btree (conversation_id);


--
-- Name: idx_message_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_created ON public.messages USING btree (created_at);


--
-- Name: idx_message_flagged; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_flagged ON public.messages USING btree (is_flagged);


--
-- Name: idx_message_report_message; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_report_message ON public.message_reports USING btree (message_id);


--
-- Name: idx_message_report_reporter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_report_reporter ON public.message_reports USING btree (reporter_id);


--
-- Name: idx_message_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_sender ON public.messages USING btree (sender_id);


--
-- Name: idx_placement_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_placement_code ON public.ad_placements USING btree (code);


--
-- Name: idx_placement_type_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_placement_type_location ON public.ad_placements USING btree (placement_type, location);


--
-- Name: idx_popup_active_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_popup_active_dates ON public.popup_announcements USING btree (is_active, starts_at, expires_at);


--
-- Name: idx_popup_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_popup_priority ON public.popup_announcements USING btree (priority DESC);


--
-- Name: idx_pricing_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_dates ON public.ad_pricing USING btree (effective_from, effective_until);


--
-- Name: idx_pricing_model; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_model ON public.ad_pricing USING btree (pricing_model);


--
-- Name: idx_pricing_placement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_placement ON public.ad_pricing USING btree (placement_id, is_active);


--
-- Name: idx_user_block_blocked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_block_blocked ON public.user_blocks USING btree (blocked_id);


--
-- Name: idx_user_block_blocker; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_block_blocker ON public.user_blocks USING btree (blocker_id);


--
-- Name: ix_ad_campaign_analytics_campaign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaign_analytics_campaign_id ON public.ad_campaign_analytics USING btree (campaign_id);


--
-- Name: ix_ad_campaign_analytics_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaign_analytics_date ON public.ad_campaign_analytics USING btree (date);


--
-- Name: ix_ad_campaigns_approval_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaigns_approval_status ON public.ad_campaigns USING btree (approval_status);


--
-- Name: ix_ad_campaigns_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaigns_course_id ON public.ad_campaigns USING btree (course_id);


--
-- Name: ix_ad_campaigns_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaigns_created_at ON public.ad_campaigns USING btree (created_at);


--
-- Name: ix_ad_campaigns_end_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaigns_end_date ON public.ad_campaigns USING btree (end_date);


--
-- Name: ix_ad_campaigns_payment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaigns_payment_status ON public.ad_campaigns USING btree (payment_status);


--
-- Name: ix_ad_campaigns_placement_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaigns_placement_id ON public.ad_campaigns USING btree (placement_id);


--
-- Name: ix_ad_campaigns_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaigns_start_date ON public.ad_campaigns USING btree (start_date);


--
-- Name: ix_ad_campaigns_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaigns_status ON public.ad_campaigns USING btree (status);


--
-- Name: ix_ad_campaigns_teacher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_campaigns_teacher_id ON public.ad_campaigns USING btree (teacher_id);


--
-- Name: ix_ad_placements_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_ad_placements_code ON public.ad_placements USING btree (code);


--
-- Name: ix_ad_placements_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_placements_created_at ON public.ad_placements USING btree (created_at);


--
-- Name: ix_ad_placements_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_placements_is_active ON public.ad_placements USING btree (is_active);


--
-- Name: ix_ad_placements_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_placements_location ON public.ad_placements USING btree (location);


--
-- Name: ix_ad_placements_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_placements_priority ON public.ad_placements USING btree (priority);


--
-- Name: ix_ad_pricing_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_pricing_created_at ON public.ad_pricing USING btree (created_at);


--
-- Name: ix_ad_pricing_effective_from; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_pricing_effective_from ON public.ad_pricing USING btree (effective_from);


--
-- Name: ix_ad_pricing_effective_until; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_pricing_effective_until ON public.ad_pricing USING btree (effective_until);


--
-- Name: ix_ad_pricing_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_pricing_is_active ON public.ad_pricing USING btree (is_active);


--
-- Name: ix_ad_pricing_placement_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_pricing_placement_id ON public.ad_pricing USING btree (placement_id);


--
-- Name: ix_ad_pricing_pricing_model; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ad_pricing_pricing_model ON public.ad_pricing USING btree (pricing_model);


--
-- Name: ix_blog_categories_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_blog_categories_parent_id ON public.blog_categories USING btree (parent_id);


--
-- Name: ix_blog_categories_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_blog_categories_slug ON public.blog_categories USING btree (slug);


--
-- Name: ix_blog_posts_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_blog_posts_author_id ON public.blog_posts USING btree (author_id);


--
-- Name: ix_blog_posts_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_blog_posts_published_at ON public.blog_posts USING btree (published_at);


--
-- Name: ix_blog_tags_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_blog_tags_name ON public.blog_tags USING btree (name);


--
-- Name: ix_blog_tags_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_blog_tags_slug ON public.blog_tags USING btree (slug);


--
-- Name: ix_cart_items_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cart_items_user_id ON public.cart_items USING btree (user_id);


--
-- Name: ix_categories_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_categories_is_active ON public.categories USING btree (is_active);


--
-- Name: ix_categories_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_categories_name ON public.categories USING btree (name);


--
-- Name: ix_categories_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_categories_parent_id ON public.categories USING btree (parent_id);


--
-- Name: ix_categories_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_categories_slug ON public.categories USING btree (slug);


--
-- Name: ix_content_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_audit_logs_action ON public.content_audit_logs USING btree (action);


--
-- Name: ix_content_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_audit_logs_created_at ON public.content_audit_logs USING btree (created_at);


--
-- Name: ix_content_audit_logs_resource_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_audit_logs_resource_id ON public.content_audit_logs USING btree (resource_id);


--
-- Name: ix_content_audit_logs_resource_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_audit_logs_resource_type ON public.content_audit_logs USING btree (resource_type);


--
-- Name: ix_content_audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_audit_logs_user_id ON public.content_audit_logs USING btree (user_id);


--
-- Name: ix_conversations_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_conversations_course_id ON public.conversations USING btree (course_id);


--
-- Name: ix_conversations_participant1_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_conversations_participant1_id ON public.conversations USING btree (participant1_id);


--
-- Name: ix_conversations_participant2_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_conversations_participant2_id ON public.conversations USING btree (participant2_id);


--
-- Name: ix_coupon_usages_coupon_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_coupon_usages_coupon_id ON public.coupon_usages USING btree (coupon_id);


--
-- Name: ix_coupon_usages_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_coupon_usages_user_id ON public.coupon_usages USING btree (user_id);


--
-- Name: ix_coupons_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_coupons_code ON public.coupons USING btree (code);


--
-- Name: ix_course_review_history_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_course_review_history_course_id ON public.course_review_history USING btree (course_id);


--
-- Name: ix_course_review_history_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_course_review_history_created_at ON public.course_review_history USING btree (created_at);


--
-- Name: ix_course_reviews_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_course_reviews_course_id ON public.course_reviews USING btree (course_id);


--
-- Name: ix_course_reviews_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_course_reviews_user_id ON public.course_reviews USING btree (user_id);


--
-- Name: ix_courses_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_courses_slug ON public.courses USING btree (slug);


--
-- Name: ix_crm_audience_members_audience_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_crm_audience_members_audience_id ON public.crm_audience_members USING btree (audience_id);


--
-- Name: ix_crm_audience_members_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_crm_audience_members_user_id ON public.crm_audience_members USING btree (user_id);


--
-- Name: ix_crm_audiences_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_crm_audiences_created_by ON public.crm_audiences USING btree (created_by);


--
-- Name: ix_crm_email_templates_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_crm_email_templates_created_by ON public.crm_email_templates USING btree (created_by);


--
-- Name: ix_email_logs_notification_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_notification_id ON public.email_logs USING btree (notification_id);


--
-- Name: ix_email_logs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_status ON public.email_logs USING btree (status);


--
-- Name: ix_email_logs_template_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_template_name ON public.email_logs USING btree (template_name);


--
-- Name: ix_email_logs_to_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_to_email ON public.email_logs USING btree (to_email);


--
-- Name: ix_enrollments_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_enrollments_course_id ON public.enrollments USING btree (course_id);


--
-- Name: ix_enrollments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_enrollments_user_id ON public.enrollments USING btree (user_id);


--
-- Name: ix_lesson_progress_enrollment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_lesson_progress_enrollment_id ON public.lesson_progress USING btree (enrollment_id);


--
-- Name: ix_lesson_progress_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_lesson_progress_lesson_id ON public.lesson_progress USING btree (lesson_id);


--
-- Name: ix_lesson_progress_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_lesson_progress_user_id ON public.lesson_progress USING btree (user_id);


--
-- Name: ix_lessons_lesson_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_lessons_lesson_type ON public.lessons USING btree (lesson_type);


--
-- Name: ix_message_reports_message_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_message_reports_message_id ON public.message_reports USING btree (message_id);


--
-- Name: ix_message_reports_reporter_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_message_reports_reporter_id ON public.message_reports USING btree (reporter_id);


--
-- Name: ix_messages_conversation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- Name: ix_messages_sender_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_messages_sender_id ON public.messages USING btree (sender_id);


--
-- Name: ix_notification_preferences_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_notification_preferences_user_id ON public.notification_preferences USING btree (user_id);


--
-- Name: ix_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: ix_notifications_notification_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_notification_type ON public.notifications USING btree (notification_type);


--
-- Name: ix_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: ix_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: ix_orders_order_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: ix_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: ix_popup_announcements_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_popup_announcements_created_at ON public.popup_announcements USING btree (created_at);


--
-- Name: ix_popup_announcements_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_popup_announcements_expires_at ON public.popup_announcements USING btree (expires_at);


--
-- Name: ix_popup_announcements_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_popup_announcements_is_active ON public.popup_announcements USING btree (is_active);


--
-- Name: ix_popup_announcements_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_popup_announcements_priority ON public.popup_announcements USING btree (priority);


--
-- Name: ix_popup_announcements_starts_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_popup_announcements_starts_at ON public.popup_announcements USING btree (starts_at);


--
-- Name: ix_popup_announcements_target_audience; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_popup_announcements_target_audience ON public.popup_announcements USING btree (target_audience);


--
-- Name: ix_quiz_attempt_answers_attempt_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_quiz_attempt_answers_attempt_id ON public.quiz_attempt_answers USING btree (attempt_id);


--
-- Name: ix_quiz_attempts_quiz_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_quiz_attempts_quiz_id ON public.quiz_attempts USING btree (quiz_id);


--
-- Name: ix_quiz_attempts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_quiz_attempts_user_id ON public.quiz_attempts USING btree (user_id);


--
-- Name: ix_quiz_questions_quiz_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_quiz_questions_quiz_id ON public.quiz_questions USING btree (quiz_id);


--
-- Name: ix_storage_quotas_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_storage_quotas_user_id ON public.storage_quotas USING btree (user_id);


--
-- Name: ix_teacher_bank_accounts_iban; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_teacher_bank_accounts_iban ON public.teacher_bank_accounts USING btree (iban);


--
-- Name: ix_teacher_bank_accounts_is_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_bank_accounts_is_default ON public.teacher_bank_accounts USING btree (is_default);


--
-- Name: ix_teacher_bank_accounts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_bank_accounts_status ON public.teacher_bank_accounts USING btree (status);


--
-- Name: ix_teacher_bank_accounts_teacher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_bank_accounts_teacher_id ON public.teacher_bank_accounts USING btree (teacher_id);


--
-- Name: ix_teacher_earnings_ad_campaign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_earnings_ad_campaign_id ON public.teacher_earnings USING btree (ad_campaign_id);


--
-- Name: ix_teacher_earnings_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_earnings_course_id ON public.teacher_earnings USING btree (course_id);


--
-- Name: ix_teacher_earnings_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_earnings_created_at ON public.teacher_earnings USING btree (created_at);


--
-- Name: ix_teacher_earnings_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_earnings_order_id ON public.teacher_earnings USING btree (order_id);


--
-- Name: ix_teacher_earnings_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_earnings_reference_id ON public.teacher_earnings USING btree (reference_id);


--
-- Name: ix_teacher_earnings_teacher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_earnings_teacher_id ON public.teacher_earnings USING btree (teacher_id);


--
-- Name: ix_teacher_earnings_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_earnings_type ON public.teacher_earnings USING btree (type);


--
-- Name: ix_teacher_earnings_withdrawal_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_teacher_earnings_withdrawal_request_id ON public.teacher_earnings USING btree (withdrawal_request_id);


--
-- Name: ix_user_blocks_blocked_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_blocks_blocked_id ON public.user_blocks USING btree (blocked_id);


--
-- Name: ix_user_blocks_blocker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_blocks_blocker_id ON public.user_blocks USING btree (blocker_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_phone ON public.users USING btree (phone);


--
-- Name: ix_withdrawal_requests_bank_account_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_withdrawal_requests_bank_account_id ON public.withdrawal_requests USING btree (bank_account_id);


--
-- Name: ix_withdrawal_requests_requested_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_withdrawal_requests_requested_at ON public.withdrawal_requests USING btree (requested_at);


--
-- Name: ix_withdrawal_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_withdrawal_requests_status ON public.withdrawal_requests USING btree (status);


--
-- Name: ix_withdrawal_requests_teacher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_withdrawal_requests_teacher_id ON public.withdrawal_requests USING btree (teacher_id);


--
-- Name: ad_campaign_analytics ad_campaign_analytics_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaign_analytics
    ADD CONSTRAINT ad_campaign_analytics_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;


--
-- Name: ad_campaigns ad_campaigns_approved_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_approved_by_id_fkey FOREIGN KEY (approved_by_id) REFERENCES public.users(id);


--
-- Name: ad_campaigns ad_campaigns_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: ad_campaigns ad_campaigns_placement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_placement_id_fkey FOREIGN KEY (placement_id) REFERENCES public.ad_placements(id);


--
-- Name: ad_campaigns ad_campaigns_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: ad_pricing ad_pricing_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_pricing
    ADD CONSTRAINT ad_pricing_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: ad_pricing ad_pricing_placement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_pricing
    ADD CONSTRAINT ad_pricing_placement_id_fkey FOREIGN KEY (placement_id) REFERENCES public.ad_placements(id);


--
-- Name: ad_pricing ad_pricing_updated_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_pricing
    ADD CONSTRAINT ad_pricing_updated_by_id_fkey FOREIGN KEY (updated_by_id) REFERENCES public.users(id);


--
-- Name: blog_categories blog_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.blog_categories(id) ON DELETE SET NULL;


--
-- Name: blog_post_categories blog_post_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE CASCADE;


--
-- Name: blog_post_categories blog_post_categories_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_tags blog_post_tags_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_tags
    ADD CONSTRAINT blog_post_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_tags blog_post_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_tags
    ADD CONSTRAINT blog_post_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.blog_tags(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: cart_items cart_items_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: certificate_templates certificate_templates_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_templates
    ADD CONSTRAINT certificate_templates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: certificate_templates certificate_templates_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_templates
    ADD CONSTRAINT certificate_templates_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: certificates certificates_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: certificates certificates_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id);


--
-- Name: certificates certificates_revoked_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_revoked_by_id_fkey FOREIGN KEY (revoked_by_id) REFERENCES public.users(id);


--
-- Name: certificates certificates_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.certificate_templates(id);


--
-- Name: certificates certificates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: content_audit_logs content_audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_audit_logs
    ADD CONSTRAINT content_audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: conversations conversations_participant1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_participant2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES public.users(id);


--
-- Name: coupon_usages coupon_usages_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: coupon_usages coupon_usages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: coupon_usages coupon_usages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: coupons coupons_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: course_categories course_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: course_categories course_categories_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_review_history course_review_history_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_review_history
    ADD CONSTRAINT course_review_history_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: course_review_history course_review_history_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_review_history
    ADD CONSTRAINT course_review_history_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_reviews course_reviews_approved_by_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_approved_by_admin_id_fkey FOREIGN KEY (approved_by_admin_id) REFERENCES public.users(id);


--
-- Name: course_reviews course_reviews_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_reviews course_reviews_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id);


--
-- Name: course_reviews course_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: courses courses_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.users(id);


--
-- Name: courses courses_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: crm_audience_members crm_audience_members_audience_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_audience_members
    ADD CONSTRAINT crm_audience_members_audience_id_fkey FOREIGN KEY (audience_id) REFERENCES public.crm_audiences(id) ON DELETE CASCADE;


--
-- Name: crm_audience_members crm_audience_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_audience_members
    ADD CONSTRAINT crm_audience_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: crm_audiences crm_audiences_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_audiences
    ADD CONSTRAINT crm_audiences_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: crm_email_templates crm_email_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_email_templates
    ADD CONSTRAINT crm_email_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: email_logs email_logs_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE SET NULL;


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: enrollments enrollments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: teacher_earnings fk_teacher_earnings_ad_campaign_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_earnings
    ADD CONSTRAINT fk_teacher_earnings_ad_campaign_id FOREIGN KEY (ad_campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE SET NULL;


--
-- Name: teacher_earnings fk_teacher_earnings_withdrawal_request_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_earnings
    ADD CONSTRAINT fk_teacher_earnings_withdrawal_request_id FOREIGN KEY (withdrawal_request_id) REFERENCES public.withdrawal_requests(id) ON DELETE SET NULL;


--
-- Name: lesson_progress lesson_progress_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id);


--
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: lesson_progress lesson_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: lessons lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: message_reports message_reports_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reports
    ADD CONSTRAINT message_reports_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id);


--
-- Name: message_reports message_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reports
    ADD CONSTRAINT message_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: messages messages_moderated_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_moderated_by_id_fkey FOREIGN KEY (moderated_by_id) REFERENCES public.users(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: order_items order_items_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: popup_announcements popup_announcements_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.popup_announcements
    ADD CONSTRAINT popup_announcements_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: quiz_attempt_answers quiz_attempt_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.quiz_attempts(id);


--
-- Name: quiz_attempt_answers quiz_attempt_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id);


--
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: quizzes quizzes_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: storage_quotas storage_quotas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storage_quotas
    ADD CONSTRAINT storage_quotas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: teacher_bank_accounts teacher_bank_accounts_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_bank_accounts
    ADD CONSTRAINT teacher_bank_accounts_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teacher_earnings teacher_earnings_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_earnings
    ADD CONSTRAINT teacher_earnings_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: teacher_earnings teacher_earnings_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_earnings
    ADD CONSTRAINT teacher_earnings_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: teacher_earnings teacher_earnings_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_earnings
    ADD CONSTRAINT teacher_earnings_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teacher_earnings teacher_earnings_withdrawal_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_earnings
    ADD CONSTRAINT teacher_earnings_withdrawal_request_id_fkey FOREIGN KEY (withdrawal_request_id) REFERENCES public.withdrawal_requests(id) ON DELETE SET NULL;


--
-- Name: user_blocks user_blocks_blocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.users(id);


--
-- Name: user_blocks user_blocks_blocker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.users(id);


--
-- Name: users users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.users(id);


--
-- Name: withdrawal_requests withdrawal_requests_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.teacher_bank_accounts(id) ON DELETE RESTRICT;


--
-- Name: withdrawal_requests withdrawal_requests_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 0arJyeZ7qdppdMvOpch41euMLmhAFi8q6yqWnzmKYYsTVyNb2wioyonTfDFt5Es

