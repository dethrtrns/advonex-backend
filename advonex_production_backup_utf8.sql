--
-- PostgreSQL database dump
--

-- Dumped from database version 17.3
-- Dumped by pg_dump version 17.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AccountStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccountStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'DEACTIVATED'
);


ALTER TYPE public."AccountStatus" OWNER TO postgres;

--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'PENDING',
    'VIEWED',
    'RESPONDED',
    'CLOSED'
);


ALTER TYPE public."RequestStatus" OWNER TO postgres;

--
-- Name: ResponseStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResponseStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED'
);


ALTER TYPE public."ResponseStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'CLIENT',
    'LAWYER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ClientProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ClientProfile" (
    id text NOT NULL,
    name text,
    photo text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "registrationPending" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."ClientProfile" OWNER TO postgres;

--
-- Name: ConsultationRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ConsultationRequest" (
    id text NOT NULL,
    "clientProfileId" text NOT NULL,
    "lawyerProfileId" text NOT NULL,
    message text NOT NULL,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    response text,
    "responseReason" text,
    "responseStatus" public."ResponseStatus" DEFAULT 'PENDING'::public."ResponseStatus" NOT NULL,
    "responseTimestamp" timestamp(3) without time zone
);


ALTER TABLE public."ConsultationRequest" OWNER TO postgres;

--
-- Name: Education; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Education" (
    id text NOT NULL,
    degree text NOT NULL,
    institution text NOT NULL,
    year integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lawyerProfileId" text NOT NULL
);


ALTER TABLE public."Education" OWNER TO postgres;

--
-- Name: EmailOtp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailOtp" (
    id text NOT NULL,
    email text NOT NULL,
    otp text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isUsed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmailOtp" OWNER TO postgres;

--
-- Name: LawyerPracticeArea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LawyerPracticeArea" (
    "lawyerProfileId" text NOT NULL,
    "practiceAreaId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LawyerPracticeArea" OWNER TO postgres;

--
-- Name: LawyerPracticeCourt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LawyerPracticeCourt" (
    "lawyerProfileId" text NOT NULL,
    "practiceCourtId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LawyerPracticeCourt" OWNER TO postgres;

--
-- Name: LawyerProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LawyerProfile" (
    id text NOT NULL,
    photo text,
    location text,
    experience integer,
    bio text,
    "consultFee" integer,
    "barId" text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "specializationId" text,
    "primaryCourtId" text,
    "registrationPending" boolean DEFAULT true NOT NULL,
    name text
);


ALTER TABLE public."LawyerProfile" OWNER TO postgres;

--
-- Name: LawyerService; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LawyerService" (
    "lawyerProfileId" text NOT NULL,
    "serviceId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LawyerService" OWNER TO postgres;

--
-- Name: PhoneOtp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PhoneOtp" (
    id text NOT NULL,
    "phoneNumber" text NOT NULL,
    otp text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    role public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PhoneOtp" OWNER TO postgres;

--
-- Name: PracticeArea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PracticeArea" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PracticeArea" OWNER TO postgres;

--
-- Name: PracticeCourt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PracticeCourt" (
    id text NOT NULL,
    name text NOT NULL,
    location text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PracticeCourt" OWNER TO postgres;

--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    "hashedToken" text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO postgres;

--
-- Name: SavedLawyer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SavedLawyer" (
    id text NOT NULL,
    "clientProfileId" text NOT NULL,
    "lawyerProfileId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SavedLawyer" OWNER TO postgres;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isPredefined" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Service" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "phoneNumber" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "accountStatus" public."AccountStatus" DEFAULT 'ACTIVE'::public."AccountStatus" NOT NULL,
    email text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserRole" (
    id text NOT NULL,
    role public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."UserRole" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: ClientProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClientProfile" (id, name, photo, "createdAt", "updatedAt", "userId", "registrationPending") FROM stdin;
550e8400-e29b-41d4-a716-446655440026	Alice Adams	https://example.com/photos/alice.jpg	2025-05-05 10:28:57.024	2025-05-05 10:28:57.024	550e8400-e29b-41d4-a716-446655440020	f
550e8400-e29b-41d4-a716-446655440027	Bob Brown	https://example.com/photos/bob.jpg	2025-05-05 10:28:57.026	2025-05-05 10:28:57.026	550e8400-e29b-41d4-a716-446655440021	f
550e8400-e29b-41d4-a716-446655440028	Carol Clark	https://example.com/photos/carol.jpg	2025-05-05 10:28:57.028	2025-05-05 10:28:57.028	550e8400-e29b-41d4-a716-446655440022	t
49c83b55-eb6b-47d7-8c9a-8e9e5a2e2c16	\N	\N	2025-05-05 10:33:37.273	2025-05-05 10:33:37.273	37b60632-5d72-4ed9-836d-fecdc52b5c81	t
fd3433c5-004f-4934-9941-eb554a25a85d	Ezzy Bro	\N	2025-05-05 10:49:48.83	2025-05-05 11:49:29.027	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	f
\.


--
-- Data for Name: ConsultationRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ConsultationRequest" (id, "clientProfileId", "lawyerProfileId", message, status, "createdAt", "updatedAt", response, "responseReason", "responseStatus", "responseTimestamp") FROM stdin;
550e8400-e29b-41d4-a716-446655440037	550e8400-e29b-41d4-a716-446655440026	550e8400-e29b-41d4-a716-446655440029	I need help with a corporate merger case.	PENDING	2025-05-05 10:28:57.094	2025-05-05 10:28:57.094	\N	\N	PENDING	\N
550e8400-e29b-41d4-a716-446655440038	550e8400-e29b-41d4-a716-446655440027	550e8400-e29b-41d4-a716-446655440030	I need assistance with a criminal defense case.	RESPONDED	2025-05-05 10:28:57.097	2025-05-05 10:28:57.097	\N	\N	PENDING	\N
550e8400-e29b-41d4-a716-446655440039	550e8400-e29b-41d4-a716-446655440028	550e8400-e29b-41d4-a716-446655440031	Need help with a property purchase agreement.	RESPONDED	2025-05-05 10:28:57.099	2025-05-05 10:28:57.099	\N	\N	PENDING	\N
\.


--
-- Data for Name: Education; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Education" (id, degree, institution, year, "createdAt", "updatedAt", "lawyerProfileId") FROM stdin;
550e8400-e29b-41d4-a716-446655440032	Bachelor of Laws (LL.B.)	Thammasat University Faculty of Law	2014	2025-05-05 10:28:57.038	2025-05-05 10:28:57.038	550e8400-e29b-41d4-a716-446655440029
550e8400-e29b-41d4-a716-446655440033	Bachelor of Laws (LL.B.)	Chulalongkorn University Faculty of Law	2019	2025-05-05 10:28:57.041	2025-05-05 10:28:57.041	550e8400-e29b-41d4-a716-446655440030
550e8400-e29b-41d4-a716-446655440034	Bachelor of Laws (LL.B.)	Mahidol University Faculty of Law	2016	2025-05-05 10:28:57.043	2025-05-05 10:28:57.043	550e8400-e29b-41d4-a716-446655440031
90b3bd70-c713-4521-b9a7-4cc36f01ee1e	Bakalat	Bihari Law University	1921	2025-05-06 10:46:20.903	2025-05-24 11:46:10.196	a37b7b1d-f0ea-4d27-8981-987120cd1939
06d15287-be7d-47db-a756-b8a960b20b1c	LLB	Vakalat institute of Lahore	1999	2025-06-02 10:34:06.707	2025-06-03 11:27:19.564	23670378-e63e-4a3d-b699-015fa1ab4835
\.


--
-- Data for Name: EmailOtp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailOtp" (id, email, otp, "expiresAt", "isUsed", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LawyerPracticeArea; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LawyerPracticeArea" ("lawyerProfileId", "practiceAreaId", "assignedAt") FROM stdin;
550e8400-e29b-41d4-a716-446655440029	550e8400-e29b-41d4-a716-446655440000	2025-05-05 10:28:57.045
550e8400-e29b-41d4-a716-446655440029	550e8400-e29b-41d4-a716-446655440003	2025-05-05 10:28:57.047
550e8400-e29b-41d4-a716-446655440029	550e8400-e29b-41d4-a716-446655440004	2025-05-05 10:28:57.048
550e8400-e29b-41d4-a716-446655440030	550e8400-e29b-41d4-a716-446655440001	2025-05-05 10:28:57.05
550e8400-e29b-41d4-a716-446655440030	550e8400-e29b-41d4-a716-446655440002	2025-05-05 10:28:57.052
550e8400-e29b-41d4-a716-446655440031	550e8400-e29b-41d4-a716-446655440003	2025-05-05 10:28:57.053
550e8400-e29b-41d4-a716-446655440031	550e8400-e29b-41d4-a716-446655440000	2025-05-05 10:28:57.054
\.


--
-- Data for Name: LawyerPracticeCourt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LawyerPracticeCourt" ("lawyerProfileId", "practiceCourtId", "assignedAt") FROM stdin;
550e8400-e29b-41d4-a716-446655440029	550e8400-e29b-41d4-a716-446655440006	2025-05-05 10:28:57.057
550e8400-e29b-41d4-a716-446655440029	550e8400-e29b-41d4-a716-446655440005	2025-05-05 10:28:57.059
550e8400-e29b-41d4-a716-446655440030	550e8400-e29b-41d4-a716-446655440007	2025-05-05 10:28:57.061
550e8400-e29b-41d4-a716-446655440030	550e8400-e29b-41d4-a716-446655440006	2025-05-05 10:28:57.063
550e8400-e29b-41d4-a716-446655440031	550e8400-e29b-41d4-a716-446655440008	2025-05-05 10:28:57.065
550e8400-e29b-41d4-a716-446655440031	550e8400-e29b-41d4-a716-446655440006	2025-05-05 10:28:57.067
\.


--
-- Data for Name: LawyerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LawyerProfile" (id, photo, location, experience, bio, "consultFee", "barId", "isVerified", "createdAt", "updatedAt", "userId", "specializationId", "primaryCourtId", "registrationPending", name) FROM stdin;
0fbb5f48-d4dd-471f-98a9-406b34af9e18	\N	\N	\N	\N	\N	\N	f	2025-05-25 08:55:24.736	2025-05-25 08:55:24.736	78468200-d7ca-4523-bb17-a3d4170e2d64	\N	\N	t	\N
a37b7b1d-f0ea-4d27-8981-987120cd1939	https://res.cloudinary.com/dnskl0pk3/image/upload/v1748686632/advonex/lawyer-profiles/dstkrwuojn2tsybrs6cb.jpg	Patna, Bihar	50	Hamm vakil hai! aur hamse achhi vakalat koi nahi karta! samjhe? \nTop bihar lawyer	1007	BAR9900	f	2025-05-05 10:44:58.734	2025-05-31 10:17:11.684	7114ac3c-be69-4575-8f46-4fa332197c80	129a844f-e1d2-4302-97de-51c3e78ceaa8	838bb1d3-0c99-4b67-97ad-ce69bf402a81	f	Alex Vakil Bhai
23670378-e63e-4a3d-b699-015fa1ab4835	https://res.cloudinary.com/dnskl0pk3/image/upload/v1747232826/advonex/lawyer-profiles/e5tjoty4dbndqtjbjlxq.jpg	Ranchi, Jharkhand	22	NIDnsininininn nisnvinsin niscnisncin sdbubub jdabjbbsib.	0	122121222122121223454	f	2025-05-14 14:19:34.325	2025-06-03 11:27:19.564	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	a34f9ab4-e628-4d90-be9f-5673aed57b6a	e8feea86-57cd-4e0f-a227-ffa81c567092	f	Ezzy  Bakil
550e8400-e29b-41d4-a716-446655440031	\N	Phuket, Thailand	8	Specialized in real estate and property law with extensive experience in coastal properties.	2500	BAR13579	t	2025-05-05 10:28:57.036	2025-05-06 11:09:45.551	550e8400-e29b-41d4-a716-446655440025	550e8400-e29b-41d4-a716-446655440003	550e8400-e29b-41d4-a716-446655440008	f	Michael Brown
550e8400-e29b-41d4-a716-446655440029	https://media.istockphoto.com/id/1134614653/photo/concerned-mature-indian-businessman-at-office-desk-with-laptop-computer.webp?b=1&s=612x612&w=0&k=20&c=sVUyU8N4TDu-ESq5vkfYD3FvT4TOInLw9sfUIhWT6ws=	Bangkok, Thailand	10	Experienced corporate lawyer specializing in mergers and acquisitions.	3000	BAR12345	t	2025-05-05 10:28:57.03	2025-05-06 13:31:03.813	550e8400-e29b-41d4-a716-446655440023	550e8400-e29b-41d4-a716-446655440000	550e8400-e29b-41d4-a716-446655440006	f	John Smith
550e8400-e29b-41d4-a716-446655440030	https://media.istockphoto.com/id/1358268545/photo/young-girl-sitting-on-table-and-using-her-mobile-phone.webp?b=1&s=612x612&w=0&k=20&c=9e-I2hGxX5Axe9FwqkeDtj0hSgCzYkbHHhfo3becCIs=	Chiang Mai, Thailand	5	Dedicated criminal defense attorney with a focus on client rights.	2000	BAR67890	f	2025-05-05 10:28:57.033	2025-05-06 13:31:03.813	550e8400-e29b-41d4-a716-446655440024	550e8400-e29b-41d4-a716-446655440001	550e8400-e29b-41d4-a716-446655440007	f	Sarah Johnson
ad05b92b-a92d-4c92-ab0c-a123b0b95ffc	\N	\N	\N	\N	\N	\N	f	2025-05-14 07:41:47.106	2025-05-14 07:41:47.106	5aff483a-3c03-4002-8bd3-28b2294bd851	\N	\N	t	\N
\.


--
-- Data for Name: LawyerService; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LawyerService" ("lawyerProfileId", "serviceId", "assignedAt") FROM stdin;
550e8400-e29b-41d4-a716-446655440029	550e8400-e29b-41d4-a716-446655440010	2025-05-05 10:28:57.069
550e8400-e29b-41d4-a716-446655440029	550e8400-e29b-41d4-a716-446655440012	2025-05-05 10:28:57.072
550e8400-e29b-41d4-a716-446655440029	550e8400-e29b-41d4-a716-446655440014	2025-05-05 10:28:57.074
550e8400-e29b-41d4-a716-446655440030	550e8400-e29b-41d4-a716-446655440010	2025-05-05 10:28:57.076
550e8400-e29b-41d4-a716-446655440030	550e8400-e29b-41d4-a716-446655440011	2025-05-05 10:28:57.078
550e8400-e29b-41d4-a716-446655440030	550e8400-e29b-41d4-a716-446655440013	2025-05-05 10:28:57.08
550e8400-e29b-41d4-a716-446655440031	550e8400-e29b-41d4-a716-446655440010	2025-05-05 10:28:57.082
550e8400-e29b-41d4-a716-446655440031	550e8400-e29b-41d4-a716-446655440012	2025-05-05 10:28:57.083
550e8400-e29b-41d4-a716-446655440031	550e8400-e29b-41d4-a716-446655440018	2025-05-05 10:28:57.085
\.


--
-- Data for Name: PhoneOtp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PhoneOtp" (id, "phoneNumber", otp, "expiresAt", role, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PracticeArea; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PracticeArea" (id, name, description, "createdAt", "updatedAt") FROM stdin;
129a844f-e1d2-4302-97de-51c3e78ceaa8	consumer-protection-law	Practice area: consumer-protection-law	2025-05-22 09:08:26.044	2025-05-22 09:08:26.044
8ef305db-10b4-422c-9644-9f895d72e0b3	environmental-law	Practice area: environmental-law	2025-06-02 10:34:06.699	2025-06-02 10:34:06.699
a34f9ab4-e628-4d90-be9f-5673aed57b6a	tax-law	Practice area: tax-law	2025-06-03 11:27:19.561	2025-06-03 11:27:19.561
550e8400-e29b-41d4-a716-446655440000	Corporate Law	Legal matters related to business and corporate entities	2025-05-05 10:28:56.956	2025-05-05 10:28:56.956
550e8400-e29b-41d4-a716-446655440001	Criminal Law	Legal matters related to criminal offenses and defense	2025-05-05 10:28:56.967	2025-05-05 10:28:56.967
550e8400-e29b-41d4-a716-446655440002	Family Law	Legal matters related to family relationships and domestic issues	2025-05-05 10:28:56.968	2025-05-05 10:28:56.968
550e8400-e29b-41d4-a716-446655440003	Real Estate Law	Legal matters related to property and real estate transactions	2025-05-05 10:28:56.969	2025-05-05 10:28:56.969
550e8400-e29b-41d4-a716-446655440004	Intellectual Property Law	Legal matters related to patents, trademarks, and copyrights	2025-05-05 10:28:56.97	2025-05-05 10:28:56.97
83983d9c-0cca-4377-b49f-a33c730265e9	string	Practice area: string	2025-05-06 11:33:02.721	2025-05-06 11:33:02.721
aa2fb7e1-b07d-4d0e-865f-08346f916244	Bawal ke mamle	Practice area: Bawal ke mamle	2025-05-21 08:52:17.08	2025-05-21 08:52:17.08
\.


--
-- Data for Name: PracticeCourt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PracticeCourt" (id, name, location, "createdAt", "updatedAt") FROM stdin;
550e8400-e29b-41d4-a716-446655440005	Supreme Court	New Delhi	2025-05-05 10:28:56.972	2025-05-05 10:28:56.972
550e8400-e29b-41d4-a716-446655440006	High Court	Mumbai	2025-05-05 10:28:56.975	2025-05-05 10:28:56.975
550e8400-e29b-41d4-a716-446655440007	District Court	Bangalore	2025-05-05 10:28:56.976	2025-05-05 10:28:56.976
550e8400-e29b-41d4-a716-446655440008	Family Court	Chennai	2025-05-05 10:28:56.978	2025-05-05 10:28:56.978
550e8400-e29b-41d4-a716-446655440009	Consumer Court	Kolkata	2025-05-05 10:28:56.98	2025-05-05 10:28:56.98
6c948cce-5fe2-43da-b9e6-292b9ec45da4	Janta Adalat, Mohalla bazaar	Location to be updated	2025-05-06 11:33:02.725	2025-05-06 11:33:02.725
0016e6fb-84c1-4a5e-8d4e-40c3d6e99453	[object Object]	Location to be updated	2025-05-06 11:56:45.199	2025-05-06 11:56:45.199
a967475b-8e5f-4f6a-9d77-bf240473ed6b	Janta Ki Adalat	Location to be updated	2025-05-06 11:57:29.341	2025-05-06 11:57:29.341
55cf9f51-a7ee-49d7-a01d-d42ae9179c5e	Bawalia High Court of Bihar	Location to be updated	2025-05-21 08:53:55.544	2025-05-21 08:53:55.544
838bb1d3-0c99-4b67-97ad-ce69bf402a81	High Court, Patna	Location to be updated	2025-05-22 08:54:27.693	2025-05-22 08:54:27.693
e8feea86-57cd-4e0f-a227-ffa81c567092	Kachahari	Location to be updated	2025-06-02 10:34:06.704	2025-06-02 10:34:06.704
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, "hashedToken", "userId", "expiresAt", "createdAt", "updatedAt") FROM stdin;
7ac7e82d-ac44-497f-abe9-3f59b4622158	$2b$10$gpjeDH/yZqMiPpd4wVF8J.OjpUzNimaRlwd6tkVXdkVlO52DYS5IK	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-15 07:53:40.028	2025-05-16 07:53:40.034	2025-05-16 07:53:40.034
5d07b9f4-a148-4ec9-9622-65405e84ad16	$2b$10$2s6P9Es.1VgqPDDIIKVC1eSLWOlDfzcvhE.v648b3q.2vFjWmCiLq	37b60632-5d72-4ed9-836d-fecdc52b5c81	2025-06-04 10:33:37.349	2025-05-05 10:33:37.351	2025-05-05 10:33:37.351
12b8e4de-eebf-4203-96da-6ede8847b464	$2b$10$ZaGpZWjHBQEiKHYht5/.sueMk0pVM1/8SyRAjDsze/SyetDZMxg6.	37b60632-5d72-4ed9-836d-fecdc52b5c81	2025-06-15 11:02:28.12	2025-05-16 11:02:28.123	2025-05-16 11:02:28.123
bff5c5e6-bddc-4bc7-a536-661087ee9022	$2b$10$OcVcrBr8cYxJN4Fd1.Stg./RQQWOezxZqaFZVtN0NEWtP.ZkneYY2	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-04 10:49:48.908	2025-05-05 10:49:48.91	2025-05-05 10:49:48.91
3c36ae96-cfa3-4747-8350-53327eb93290	$2b$10$PJeg2xQFGVHK9dUoBjAdj.XnDHge5GPGOy59hM.r.0c2Wonrqk9Nu	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-04 11:20:06.644	2025-05-05 11:20:06.647	2025-05-05 11:20:06.647
4359239f-2a4e-455b-80c6-5a5bfd92c0b8	$2b$10$GfaiBkK1H8GVTDxoa7vZzOv23wZC3JPlZdeL3mlf0KBSwKjdEsBoq	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-17 10:20:55.784	2025-05-18 10:20:55.786	2025-05-18 10:20:55.786
97276b8e-422e-4733-b2d4-bcec9c1c3147	$2b$10$Mv387Wj1UoXSvX96/Rl3l.PU4fQVpoCn5ws3hU1DCZmpBUTz6YmEm	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-18 09:48:05.267	2025-05-19 09:48:05.277	2025-05-19 09:48:05.277
2bec08f4-8444-4267-a4aa-c493576b92ec	$2b$10$HaRUymNH/OGQSmEv8U8asexXmW8bYsf5V2huoxauvezHToME2D74C	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-19 08:55:21.993	2025-05-20 08:55:22	2025-05-20 08:55:22
7b36e788-e2cf-4e7d-b2b6-4881a98b9780	$2b$10$LXWsG7BJiaWDyQNvlgMA9eAcicdpiPPhCsLHGxYbIfPsI6Kjm2O3S	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-19 09:13:21.735	2025-05-20 09:13:21.741	2025-05-20 09:13:21.741
132e58b0-c095-46e0-8534-184d50693964	$2b$10$Xu1rFpTG99AayVdHj9Nn..fHX9/H04EyOlZkrqDFE.DLCe2tD/cQe	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-20 06:49:28.941	2025-05-21 06:49:28.947	2025-05-21 06:49:28.947
b321cca0-1155-4a86-a53e-32c90b2f8056	$2b$10$vbjeeAZXpkU3SJJicRp0euq3Nfp11.dY.l6QsXg8GYflWnUNAFM1m	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-20 08:05:13.23	2025-05-21 08:05:13.24	2025-05-21 08:05:13.24
8f80518d-0f1c-4b30-a241-7ab3ddf57f33	$2b$10$BmXu/xbTH7QTtevnDfEjPOmOZdI.TSix3kwl4xqaR9.Rq2TE7KrAC	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-10 12:31:58.434	2025-05-11 12:31:58.443	2025-05-11 12:31:58.443
4605f8e1-174c-4c2d-be16-4ea77249865a	$2b$10$ZxMl0IgvTkiBfTvgp.NPQO.aiOue2AFiuMNIJwkomRm52VUngLpTa	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-21 07:51:58.87	2025-05-22 07:51:58.879	2025-05-22 07:51:58.879
c5f38360-6bd8-4930-9362-d3084326e020	$2b$10$FRSGK0f8g.QvMkjGDXmbp.7vhfy7E8p6knOizMfjE0x7yPtkpYQwi	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-21 09:24:46.869	2025-05-22 09:24:46.87	2025-05-22 09:24:46.87
77361ed5-cd60-442e-bd9f-956c6a49be41	$2b$10$ufqDeYLtKJ9toxR0UEi.7u5NHFNBIuOSQGNhmsDdoo/OMwxkEMrAy	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-22 10:05:53.431	2025-05-23 10:05:53.436	2025-05-23 10:05:53.436
92b57c75-292d-47de-8704-036ae5e8ccf3	$2b$10$DZIyzPjkSuVEMrFSR6cY7uF3PiFRyeXR/axGqgaKVcmw7eNjKfRHu	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-13 07:10:26.534	2025-05-14 07:10:26.535	2025-05-14 07:10:26.535
6c159c0a-11d0-435b-abf0-9bb91e8a91b2	$2b$10$Qasx2EyZJ9WEFbF8idg9Me6N3.Cqp4xy34H4GxQKRE7ae14Elk8oC	5aff483a-3c03-4002-8bd3-28b2294bd851	2025-06-13 07:41:47.176	2025-05-14 07:41:47.178	2025-05-14 07:41:47.178
19526bf6-4f75-412a-aa47-68037cabb35a	$2b$10$90vo4CrlCFKp53h4NA43Q.WfvjIJFR6P5lvXUSwpOCeE3L/jaRLN2	78468200-d7ca-4523-bb17-a3d4170e2d64	2025-06-24 09:40:26.494	2025-05-25 09:40:26.5	2025-05-25 09:40:26.5
92a23f6c-61d2-4ff4-8cd5-a24e8f669807	$2b$10$OibwZCXVN0UMTasHHFvgc.PII//pR7zIBm4Lv/4ibopKhXPwAJiPu	37b60632-5d72-4ed9-836d-fecdc52b5c81	2025-06-13 08:46:15.353	2025-05-14 08:46:15.364	2025-05-14 08:46:15.364
bc811d00-afe8-4749-9d43-3e8aa781cdce	$2b$10$0FS5gxJJYLTuNILRLkdwLeGaJezspWUZ0mxD6IZPSL2XLsUjlHdBW	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-28 08:43:25.955	2025-05-29 08:43:25.964	2025-05-29 08:43:25.964
5e759140-bf7b-459c-9c92-b7f3fef25585	$2b$10$DVoLMmwny8FW13jPKoaNdeLFMEOKPya6p5Dwq5euBxXwaSQ6t2cH6	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-13 14:18:50.359	2025-05-14 14:18:50.361	2025-05-14 14:18:50.361
b20ad5f1-4d10-4751-84c8-c31b14e50f0b	$2b$10$PvhhGtM63G1iq6aBnOlPuuzDQ1Zg1P4afjVbJrT8AcgXQp3k6WToC	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-13 14:19:34.391	2025-05-14 14:19:34.393	2025-05-14 14:19:34.393
953bbe2a-09ac-45d1-8f21-c5a07ae682fa	$2b$10$j2K9YHAa60rJLM/FF/u2OucNzygJBy1H6JidV4lOzFodrB0ish59S	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-28 08:47:22.55	2025-05-29 08:47:22.553	2025-05-29 08:47:22.553
970f6a5f-7132-4de1-ba4f-e08ecff36142	$2b$10$q3WI56B4Yrqy1BMnVokzJOlZeqYWHj42VETBNTMlVBmSaKl07iNaO	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-06-14 12:23:56.083	2025-05-15 12:23:56.1	2025-05-15 12:23:56.1
389fa679-5f30-4a9b-9c45-14dc5bbb4c20	$2b$10$E2jEPxTQA.PkTQw.8FkYtuhLbkri/GeXkTV3VCyFruksFiiaKWsUa	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-29 08:29:56.44	2025-05-30 08:29:56.443	2025-05-30 08:29:56.443
cdeb9465-c4f9-4b46-96f7-17eb92224e1d	$2b$10$hLDohu7/Nl5sbLXPRRsM2./2lj1WSwKimCDHfqTsJNwoLG80emuqa	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-30 10:16:17.243	2025-05-31 10:16:17.248	2025-05-31 10:16:17.248
600a64d9-56f5-4761-9eaa-0c5ebc86b18c	$2b$10$WlcLBw3rk2vlwjIAsnhrdeKeak1b.Lq6c.MkpWYS4qt2mOhT1D/Wi	7114ac3c-be69-4575-8f46-4fa332197c80	2025-06-30 10:32:26.582	2025-05-31 10:32:26.594	2025-05-31 10:32:26.594
6df74001-4ea5-4c9d-b631-b38edd7e0060	$2b$10$TNytV9UkcKrmUmxjBAMY4uVNpRYNsHpBIOfXKZ72fZRLXZ0HB70Lq	78468200-d7ca-4523-bb17-a3d4170e2d64	2025-07-01 09:16:47.022	2025-06-01 09:16:47.034	2025-06-01 09:16:47.034
d15a650e-1bf4-4fc5-adbc-18d142d6a525	$2b$10$61lt8PTsn1fSnaoRVN6F6.3HEaW6vIdTKLCrDNPBUz3gQxhG7N6Zi	7114ac3c-be69-4575-8f46-4fa332197c80	2025-07-01 10:15:14.213	2025-06-01 10:15:14.216	2025-06-01 10:15:14.216
b54e6ba3-2f6c-438e-9530-2778a62a6e39	$2b$10$0BDBUHxE8NOnhSz1KUlxIOi4LsRM/I2JzSSKZywlVKcgR1ypabmLa	fc3bee1b-9d4a-4505-b0c9-5c044865c44b	2025-07-05 10:54:24.427	2025-06-05 10:54:24.439	2025-06-05 10:54:24.439
eea6097b-f22c-4cb6-a8c8-887453d739a8	$2b$10$T6HQ11uS27VnBlIyKWSlKu0t797vpqCHCdLfvbKy5t2FEgUUyXX4m	7114ac3c-be69-4575-8f46-4fa332197c80	2025-07-05 11:09:54.873	2025-06-05 11:09:54.876	2025-06-05 11:09:54.876
\.


--
-- Data for Name: SavedLawyer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SavedLawyer" (id, "clientProfileId", "lawyerProfileId", "createdAt") FROM stdin;
a35dfebf-e6fc-406a-91c3-a814f439be51	550e8400-e29b-41d4-a716-446655440026	550e8400-e29b-41d4-a716-446655440029	2025-05-05 10:28:57.087
d46efcf2-dab5-4c4a-8271-a148fea138d5	550e8400-e29b-41d4-a716-446655440027	550e8400-e29b-41d4-a716-446655440030	2025-05-05 10:28:57.09
0b17f380-46fb-4a6a-bedb-cb854493148c	550e8400-e29b-41d4-a716-446655440028	550e8400-e29b-41d4-a716-446655440031	2025-05-05 10:28:57.092
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Service" (id, name, description, "isPredefined", "createdAt", "updatedAt") FROM stdin;
550e8400-e29b-41d4-a716-446655440010	Consultation	Initial legal consultation	t	2025-05-05 10:28:56.981	2025-05-05 10:28:56.981
550e8400-e29b-41d4-a716-446655440011	Document Review	Review of legal documents	t	2025-05-05 10:28:56.983	2025-05-05 10:28:56.983
550e8400-e29b-41d4-a716-446655440012	Contract Drafting	Drafting legal contracts	t	2025-05-05 10:28:56.985	2025-05-05 10:28:56.985
550e8400-e29b-41d4-a716-446655440013	Litigation Support	Support during legal proceedings	t	2025-05-05 10:28:56.986	2025-05-05 10:28:56.986
550e8400-e29b-41d4-a716-446655440014	Legal Research	In-depth legal research	t	2025-05-05 10:28:56.988	2025-05-05 10:28:56.988
550e8400-e29b-41d4-a716-446655440015	Mediation	Legal mediation services	t	2025-05-05 10:28:56.99	2025-05-05 10:28:56.99
550e8400-e29b-41d4-a716-446655440016	Arbitration	Legal arbitration services	t	2025-05-05 10:28:56.991	2025-05-05 10:28:56.991
550e8400-e29b-41d4-a716-446655440017	Notary Services	Notary public services	t	2025-05-05 10:28:56.993	2025-05-05 10:28:56.993
550e8400-e29b-41d4-a716-446655440018	Legal Translation	Translation of legal documents	t	2025-05-05 10:28:56.995	2025-05-05 10:28:56.995
550e8400-e29b-41d4-a716-446655440019	Legal Opinion	Expert legal opinion	t	2025-05-05 10:28:56.996	2025-05-05 10:28:56.996
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "phoneNumber", "createdAt", "updatedAt", "lastLogin", "accountStatus", email) FROM stdin;
fc3bee1b-9d4a-4505-b0c9-5c044865c44b	\N	2025-05-05 10:49:48.816	2025-06-01 09:35:54.676	2025-06-01 09:35:54.674	ACTIVE	its.ezzygaming@gmail.com
7114ac3c-be69-4575-8f46-4fa332197c80	\N	2025-05-05 10:44:58.721	2025-06-05 10:24:58.576	2025-06-05 10:24:58.574	ACTIVE	nerodantertrns@gmail.com
5aff483a-3c03-4002-8bd3-28b2294bd851	\N	2025-05-14 07:41:47.089	2025-05-14 07:41:47.089	\N	ACTIVE	rajshekharsingh0660593@gmail.com
37b60632-5d72-4ed9-836d-fecdc52b5c81	\N	2025-05-05 10:33:37.256	2025-05-16 08:47:02.415	2025-05-16 08:47:02.412	ACTIVE	rajshekharsingh060593@gmail.com
78468200-d7ca-4523-bb17-a3d4170e2d64	\N	2025-05-25 08:55:24.723	2025-05-29 08:52:41.934	2025-05-29 08:52:41.929	ACTIVE	shashankfrom90s@gmail.com
550e8400-e29b-41d4-a716-446655440020	+66810000001	2025-05-05 10:28:56.998	2025-05-05 10:28:56.998	\N	ACTIVE	alice.adams@email.com
550e8400-e29b-41d4-a716-446655440021	+66810000002	2025-05-05 10:28:57.001	2025-05-05 10:28:57.001	\N	ACTIVE	bob.brown@email.com
550e8400-e29b-41d4-a716-446655440022	+66810000003	2025-05-05 10:28:57.003	2025-05-05 10:28:57.003	\N	ACTIVE	carol.clark@email.com
550e8400-e29b-41d4-a716-446655440023	+66810000011	2025-05-05 10:28:57.005	2025-05-05 10:28:57.005	\N	ACTIVE	john.smith@email.com
550e8400-e29b-41d4-a716-446655440024	+66810000012	2025-05-05 10:28:57.007	2025-05-05 10:28:57.007	\N	ACTIVE	sarah.johnson@email.com
550e8400-e29b-41d4-a716-446655440025	+66810000013	2025-05-05 10:28:57.009	2025-05-05 10:28:57.009	\N	ACTIVE	michael.brown@email.com
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserRole" (id, role, "isActive", "createdAt", "updatedAt", "userId") FROM stdin;
92753414-c2ec-42ef-8dbb-dd5b58b493a1	CLIENT	t	2025-05-05 10:28:57.011	2025-05-05 10:28:57.011	550e8400-e29b-41d4-a716-446655440020
18032ccd-b0bf-4c52-b5dd-23233101e7c5	CLIENT	t	2025-05-05 10:28:57.014	2025-05-05 10:28:57.014	550e8400-e29b-41d4-a716-446655440021
8f14f877-99b2-4a6a-a533-59d4d3c60e63	CLIENT	t	2025-05-05 10:28:57.016	2025-05-05 10:28:57.016	550e8400-e29b-41d4-a716-446655440022
1c785728-9fec-4e98-9bc5-d2e7aa38fb1d	LAWYER	t	2025-05-05 10:28:57.018	2025-05-05 10:28:57.018	550e8400-e29b-41d4-a716-446655440023
f488a0fa-df68-4915-8faa-66e7c2c27d63	LAWYER	t	2025-05-05 10:28:57.02	2025-05-05 10:28:57.02	550e8400-e29b-41d4-a716-446655440024
1471dc24-8416-4e3e-b56f-a7ee6e62d234	LAWYER	t	2025-05-05 10:28:57.022	2025-05-05 10:28:57.022	550e8400-e29b-41d4-a716-446655440025
500ef103-f3b2-4d37-ac03-f39a74800354	CLIENT	t	2025-05-05 10:33:37.267	2025-05-05 10:33:37.267	37b60632-5d72-4ed9-836d-fecdc52b5c81
02b9776d-1099-42ce-b13f-c31288b8edad	LAWYER	t	2025-05-05 10:44:58.732	2025-05-05 10:44:58.732	7114ac3c-be69-4575-8f46-4fa332197c80
18fd21f9-a346-449d-8054-65cffdfeefbb	LAWYER	t	2025-05-14 07:41:47.103	2025-05-14 07:41:47.103	5aff483a-3c03-4002-8bd3-28b2294bd851
2d371489-05ab-4f77-8c04-5b5e74db266a	CLIENT	f	2025-05-05 10:49:48.828	2025-05-14 14:19:34.316	fc3bee1b-9d4a-4505-b0c9-5c044865c44b
e8716147-7347-4fd4-851f-6225c2d74a6f	LAWYER	t	2025-05-14 14:19:34.319	2025-05-14 14:19:34.319	fc3bee1b-9d4a-4505-b0c9-5c044865c44b
984e0480-981f-441b-bf3a-49b7911e6aac	LAWYER	t	2025-05-25 08:55:24.734	2025-05-25 08:55:24.734	78468200-d7ca-4523-bb17-a3d4170e2d64
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
53d650fb-1626-4e04-9723-2a0e572e9caf	68c24257d0f2ccabc4a1faedfec2401bb6b51865e190c80ffde1de1ec775c0be	2025-04-29 17:20:23.268213+05:30	20250429115023_init	\N	\N	2025-04-29 17:20:23.180963+05:30	1
1747211e-5e32-4b36-98e1-df00a9e8b7bf	ecce40696644e3df02b7a5ecd4ecb1137bc654ad9d7d66a7fddfa48fd3fd7f89	\N	20250516074255_add_device_id_to_refresh_token	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250516074255_add_device_id_to_refresh_token\n\nDatabase error code: 23505\n\nDatabase error:\nERROR: could not create unique index "RefreshToken_userId_deviceId_key"\nDETAIL: Key ("userId", "deviceId")=(fc3bee1b-9d4a-4505-b0c9-5c044865c44b, legacy_device) is duplicated.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23505), message: "could not create unique index \\"RefreshToken_userId_deviceId_key\\"", detail: Some("Key (\\"userId\\", \\"deviceId\\")=(fc3bee1b-9d4a-4505-b0c9-5c044865c44b, legacy_device) is duplicated."), hint: None, position: None, where_: None, schema: Some("public"), table: Some("RefreshToken"), column: None, datatype: None, constraint: Some("RefreshToken_userId_deviceId_key"), file: Some("tuplesortvariants.c"), line: Some(1557), routine: Some("comparetup_index_btree_tiebreak") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250516074255_add_device_id_to_refresh_token"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250516074255_add_device_id_to_refresh_token"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:225	\N	2025-05-16 13:12:56.804248+05:30	0
11d9bbb2-49dc-4123-b4b8-cc3d948a6874	30850a2bda28cc50f40359df61989102e51076752651005c451b861f78d9251e	2025-05-01 12:11:10.065934+05:30	20250501064110_add_updated_at_to_otp	\N	\N	2025-05-01 12:11:10.048939+05:30	1
a866d270-d5f4-4459-b33e-b793fa481ebf	6df650a601467be6c2805570a42dfb08555b6b4f9d8431ebba3200883042f217	2025-05-01 12:20:04.584617+05:30	20250501065004_add_last_login_to_user	\N	\N	2025-05-01 12:20:04.576493+05:30	1
4b6b9e57-3367-4c5c-ad31-4bc1aca0afda	4376b44a6b891034b1914e9f1fbe2159d498ee3a6c7ab6f4b18ed878e993100e	2025-05-01 15:01:52.212716+05:30	20250501093152_add_refresh_tokens_and_status	\N	\N	2025-05-01 15:01:52.18893+05:30	1
1596f8de-c4a7-47ad-a4d1-23ae61ee6825	04f4704be97a9ee747885779a61bcd5c45dec62d8ab48fae10f31319784d0b3c	2025-05-02 13:18:30.798171+05:30	20250502074830_move_registration_pending	\N	\N	2025-05-02 13:18:30.791707+05:30	1
b8d9a671-2b58-451b-9be8-2430363f672b	3295e602558dc9692087fd6572de475c1aff458ae287ecc786e28ab4fb380b0f	2025-05-02 14:20:49.165318+05:30	20250502085048_add_user_role_table	\N	\N	2025-05-02 14:20:49.148039+05:30	1
c8357aa2-11dc-466b-b80e-ae4c477fd795	3e051aa0deca9940c684f5e2e83dc207300ec37273ac1e41d6894e279fe9d8e5	2025-05-02 14:37:55.785862+05:30	20250502090755_add_role_indexing_otp_phone_unique_removed	\N	\N	2025-05-02 14:37:55.780044+05:30	1
b15aff30-79b1-43aa-9b35-dd65e5e24b46	fa3c63e6777d6dcac0f9a42dc2c4d805583cb9e83671fa85b6af994288c89151	2025-05-05 12:18:39.328733+05:30	20250505064838_add_lawyer_name_field	\N	\N	2025-05-05 12:18:39.325291+05:30	1
a81b5648-3d03-4b5e-b57c-0c884bff03c8	5e96509d57fc5fcb1e24531cafe23f92fa51690e07c7f066ee02a984dc1c95d1	2025-05-05 12:36:01.765424+05:30	20250505070601_add_consultation_response_fields	\N	\N	2025-05-05 12:36:01.754321+05:30	1
947c15e6-0a8c-49c0-bd69-8da32bafe14c	15cf35d2a5e91287098ad25f50a78fa99a998d86d7ce5788d51c5299fe72533d	2025-05-05 14:53:05.238528+05:30	20250505092304_add_email_otp	\N	\N	2025-05-05 14:53:05.217481+05:30	1
1dab1681-7b9b-4315-8123-4e013dde1de4	684d22c089e0c0e741612760cf3d4fc2881261b5fdfbb8f6553dc210b03a1295	2025-05-05 15:05:55.300883+05:30	20250505093554_add_email_to_user	\N	\N	2025-05-05 15:05:55.290524+05:30	1
110217ad-3096-48e7-9d18-b9079525082c	3cc397a75dec9e8bbf9be99eec3e302ee85dc8cfaac9a355028537efb9dbcaac	2025-05-05 15:19:11.030726+05:30	20250505094910_rename_otp_to_phone_otp	\N	\N	2025-05-05 15:19:11.015279+05:30	1
4e8d1cb5-7350-4b6d-87a2-f889e742a0b5	a0fc1153c8f01b6cd7c262ad964ecbe14d0bad119fcc1390b17ab897d2d0db78	2025-05-05 15:58:43.99663+05:30	20250505102843_remove_email_from_client_profile	\N	\N	2025-05-05 15:58:43.990642+05:30	1
\.


--
-- Name: ClientProfile ClientProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientProfile"
    ADD CONSTRAINT "ClientProfile_pkey" PRIMARY KEY (id);


--
-- Name: ConsultationRequest ConsultationRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ConsultationRequest"
    ADD CONSTRAINT "ConsultationRequest_pkey" PRIMARY KEY (id);


--
-- Name: Education Education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Education"
    ADD CONSTRAINT "Education_pkey" PRIMARY KEY (id);


--
-- Name: EmailOtp EmailOtp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailOtp"
    ADD CONSTRAINT "EmailOtp_pkey" PRIMARY KEY (id);


--
-- Name: LawyerPracticeArea LawyerPracticeArea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerPracticeArea"
    ADD CONSTRAINT "LawyerPracticeArea_pkey" PRIMARY KEY ("lawyerProfileId", "practiceAreaId");


--
-- Name: LawyerPracticeCourt LawyerPracticeCourt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerPracticeCourt"
    ADD CONSTRAINT "LawyerPracticeCourt_pkey" PRIMARY KEY ("lawyerProfileId", "practiceCourtId");


--
-- Name: LawyerProfile LawyerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerProfile"
    ADD CONSTRAINT "LawyerProfile_pkey" PRIMARY KEY (id);


--
-- Name: LawyerService LawyerService_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerService"
    ADD CONSTRAINT "LawyerService_pkey" PRIMARY KEY ("lawyerProfileId", "serviceId");


--
-- Name: PhoneOtp PhoneOtp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PhoneOtp"
    ADD CONSTRAINT "PhoneOtp_pkey" PRIMARY KEY (id);


--
-- Name: PracticeArea PracticeArea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PracticeArea"
    ADD CONSTRAINT "PracticeArea_pkey" PRIMARY KEY (id);


--
-- Name: PracticeCourt PracticeCourt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PracticeCourt"
    ADD CONSTRAINT "PracticeCourt_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: SavedLawyer SavedLawyer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedLawyer"
    ADD CONSTRAINT "SavedLawyer_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ClientProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ClientProfile_userId_key" ON public."ClientProfile" USING btree ("userId");


--
-- Name: ConsultationRequest_clientProfileId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ConsultationRequest_clientProfileId_idx" ON public."ConsultationRequest" USING btree ("clientProfileId");


--
-- Name: ConsultationRequest_lawyerProfileId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ConsultationRequest_lawyerProfileId_idx" ON public."ConsultationRequest" USING btree ("lawyerProfileId");


--
-- Name: Education_lawyerProfileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Education_lawyerProfileId_key" ON public."Education" USING btree ("lawyerProfileId");


--
-- Name: EmailOtp_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailOtp_email_idx" ON public."EmailOtp" USING btree (email);


--
-- Name: EmailOtp_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailOtp_email_key" ON public."EmailOtp" USING btree (email);


--
-- Name: EmailOtp_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailOtp_expiresAt_idx" ON public."EmailOtp" USING btree ("expiresAt");


--
-- Name: LawyerPracticeArea_practiceAreaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LawyerPracticeArea_practiceAreaId_idx" ON public."LawyerPracticeArea" USING btree ("practiceAreaId");


--
-- Name: LawyerPracticeCourt_practiceCourtId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LawyerPracticeCourt_practiceCourtId_idx" ON public."LawyerPracticeCourt" USING btree ("practiceCourtId");


--
-- Name: LawyerProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LawyerProfile_userId_key" ON public."LawyerProfile" USING btree ("userId");


--
-- Name: LawyerService_serviceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LawyerService_serviceId_idx" ON public."LawyerService" USING btree ("serviceId");


--
-- Name: PhoneOtp_phoneNumber_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PhoneOtp_phoneNumber_expiresAt_idx" ON public."PhoneOtp" USING btree ("phoneNumber", "expiresAt");


--
-- Name: PracticeArea_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PracticeArea_name_key" ON public."PracticeArea" USING btree (name);


--
-- Name: PracticeCourt_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PracticeCourt_name_key" ON public."PracticeCourt" USING btree (name);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: SavedLawyer_clientProfileId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SavedLawyer_clientProfileId_idx" ON public."SavedLawyer" USING btree ("clientProfileId");


--
-- Name: SavedLawyer_clientProfileId_lawyerProfileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SavedLawyer_clientProfileId_lawyerProfileId_key" ON public."SavedLawyer" USING btree ("clientProfileId", "lawyerProfileId");


--
-- Name: SavedLawyer_lawyerProfileId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SavedLawyer_lawyerProfileId_idx" ON public."SavedLawyer" USING btree ("lawyerProfileId");


--
-- Name: Service_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Service_name_key" ON public."Service" USING btree (name);


--
-- Name: UserRole_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserRole_userId_idx" ON public."UserRole" USING btree ("userId");


--
-- Name: UserRole_userId_role_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserRole_userId_role_key" ON public."UserRole" USING btree ("userId", role);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_phoneNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_phoneNumber_key" ON public."User" USING btree ("phoneNumber");


--
-- Name: ClientProfile ClientProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientProfile"
    ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConsultationRequest ConsultationRequest_clientProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ConsultationRequest"
    ADD CONSTRAINT "ConsultationRequest_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES public."ClientProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConsultationRequest ConsultationRequest_lawyerProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ConsultationRequest"
    ADD CONSTRAINT "ConsultationRequest_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES public."LawyerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Education Education_lawyerProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Education"
    ADD CONSTRAINT "Education_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES public."LawyerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LawyerPracticeArea LawyerPracticeArea_lawyerProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerPracticeArea"
    ADD CONSTRAINT "LawyerPracticeArea_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES public."LawyerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LawyerPracticeArea LawyerPracticeArea_practiceAreaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerPracticeArea"
    ADD CONSTRAINT "LawyerPracticeArea_practiceAreaId_fkey" FOREIGN KEY ("practiceAreaId") REFERENCES public."PracticeArea"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LawyerPracticeCourt LawyerPracticeCourt_lawyerProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerPracticeCourt"
    ADD CONSTRAINT "LawyerPracticeCourt_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES public."LawyerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LawyerPracticeCourt LawyerPracticeCourt_practiceCourtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerPracticeCourt"
    ADD CONSTRAINT "LawyerPracticeCourt_practiceCourtId_fkey" FOREIGN KEY ("practiceCourtId") REFERENCES public."PracticeCourt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LawyerProfile LawyerProfile_primaryCourtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerProfile"
    ADD CONSTRAINT "LawyerProfile_primaryCourtId_fkey" FOREIGN KEY ("primaryCourtId") REFERENCES public."PracticeCourt"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LawyerProfile LawyerProfile_specializationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerProfile"
    ADD CONSTRAINT "LawyerProfile_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES public."PracticeArea"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LawyerProfile LawyerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerProfile"
    ADD CONSTRAINT "LawyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LawyerService LawyerService_lawyerProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerService"
    ADD CONSTRAINT "LawyerService_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES public."LawyerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LawyerService LawyerService_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LawyerService"
    ADD CONSTRAINT "LawyerService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SavedLawyer SavedLawyer_clientProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedLawyer"
    ADD CONSTRAINT "SavedLawyer_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES public."ClientProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SavedLawyer SavedLawyer_lawyerProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedLawyer"
    ADD CONSTRAINT "SavedLawyer_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES public."LawyerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

