--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-02-19 03:49:32

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 24599)
-- Name: avis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avis (
    id integer NOT NULL,
    reservation_id integer,
    note integer,
    commentaire text,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    CONSTRAINT avis_note_check CHECK (((note >= 1) AND (note <= 5))),
    CONSTRAINT check_statut CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'valide'::character varying, 'refuse'::character varying])::text[])))
);


ALTER TABLE public.avis OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24598)
-- Name: avis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.avis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.avis_id_seq OWNER TO postgres;

--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 221
-- Name: avis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.avis_id_seq OWNED BY public.avis.id;


--
-- TOC entry 226 (class 1259 OID 24676)
-- Name: credits_plateforme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credits_plateforme (
    id integer NOT NULL,
    trajet_id integer,
    montant integer NOT NULL,
    date_transaction timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.credits_plateforme OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24675)
-- Name: credits_plateforme_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credits_plateforme_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.credits_plateforme_id_seq OWNER TO postgres;

--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 225
-- Name: credits_plateforme_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credits_plateforme_id_seq OWNED BY public.credits_plateforme.id;


--
-- TOC entry 235 (class 1259 OID 32870)
-- Name: preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preferences (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.preferences OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24618)
-- Name: preferences_custom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preferences_custom (
    id integer NOT NULL,
    conducteur_id integer,
    description character varying(255) NOT NULL
);


ALTER TABLE public.preferences_custom OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24617)
-- Name: preferences_custom_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preferences_custom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preferences_custom_id_seq OWNER TO postgres;

--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 223
-- Name: preferences_custom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preferences_custom_id_seq OWNED BY public.preferences_custom.id;


--
-- TOC entry 234 (class 1259 OID 32869)
-- Name: preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preferences_id_seq OWNER TO postgres;

--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 234
-- Name: preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preferences_id_seq OWNED BY public.preferences.id;


--
-- TOC entry 220 (class 1259 OID 24577)
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id integer NOT NULL,
    trajet_id integer,
    passager_id integer,
    date_reservation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    prix_total numeric(10,2) NOT NULL,
    nombre_places integer NOT NULL
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24576)
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservations_id_seq OWNER TO postgres;

--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 219
-- Name: reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;


--
-- TOC entry 228 (class 1259 OID 32772)
-- Name: signalements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signalements (
    id integer NOT NULL,
    trajet_id integer,
    passager_id integer,
    description text NOT NULL,
    date_signalement timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    statut character varying(20) DEFAULT 'en_cours'::character varying,
    resolution_commentaire text,
    CONSTRAINT signalements_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'traite'::character varying, 'ignore'::character varying])::text[])))
);


ALTER TABLE public.signalements OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 32771)
-- Name: signalements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.signalements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signalements_id_seq OWNER TO postgres;

--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 227
-- Name: signalements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.signalements_id_seq OWNED BY public.signalements.id;


--
-- TOC entry 233 (class 1259 OID 32830)
-- Name: trajets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trajets (
    id integer NOT NULL,
    conducteur_id integer,
    vehicule_id integer,
    depart character varying(100) NOT NULL,
    arrivee character varying(100) NOT NULL,
    date_depart timestamp without time zone NOT NULL,
    date_arrivee timestamp without time zone,
    prix numeric(10,2) NOT NULL,
    places_totales integer NOT NULL,
    places_restantes integer NOT NULL,
    est_ecologique boolean DEFAULT false,
    commentaire text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trajets OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 32829)
-- Name: trajets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trajets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trajets_id_seq OWNER TO postgres;

--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 232
-- Name: trajets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trajets_id_seq OWNED BY public.trajets.id;


--
-- TOC entry 236 (class 1259 OID 32879)
-- Name: utilisateur_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilisateur_preferences (
    utilisateur_id integer NOT NULL,
    preference_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.utilisateur_preferences OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16421)
-- Name: utilisateurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilisateurs (
    id integer NOT NULL,
    pseudo character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    photo_url character varying(255),
    note numeric(2,1) DEFAULT 5.0,
    date_inscription timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nombre_avis integer DEFAULT 0,
    type_utilisateur character varying(20) DEFAULT 'passager'::character varying,
    credits integer DEFAULT 20,
    role character varying(20) DEFAULT 'utilisateur'::character varying,
    statut character varying(20) DEFAULT 'actif'::character varying,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_role CHECK (((role)::text = ANY ((ARRAY['utilisateur'::character varying, 'employe'::character varying, 'admin'::character varying])::text[]))),
    CONSTRAINT utilisateurs_role_check CHECK (((role)::text = ANY (ARRAY[('utilisateur'::character varying)::text, ('employe'::character varying)::text, ('admin'::character varying)::text]))),
    CONSTRAINT utilisateurs_statut_check CHECK (((statut)::text = ANY ((ARRAY['actif'::character varying, 'suspendu'::character varying])::text[])))
);


ALTER TABLE public.utilisateurs OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16420)
-- Name: utilisateurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilisateurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utilisateurs_id_seq OWNER TO postgres;

--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 217
-- Name: utilisateurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilisateurs_id_seq OWNED BY public.utilisateurs.id;


--
-- TOC entry 231 (class 1259 OID 32816)
-- Name: vehicules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicules (
    id integer NOT NULL,
    conducteur_id integer,
    marque character varying(50) NOT NULL,
    modele character varying(50) NOT NULL,
    annee integer,
    places integer NOT NULL,
    est_ecologique boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vehicules OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 32815)
-- Name: vehicules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicules_id_seq OWNER TO postgres;

--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 230
-- Name: vehicules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicules_id_seq OWNED BY public.vehicules.id;


--
-- TOC entry 229 (class 1259 OID 32809)
-- Name: vue_stats_credits; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vue_stats_credits AS
 SELECT date(date_creation) AS date,
    sum(montant) AS total_credits,
    count(*) AS nombre_transactions
   FROM public.credits_plateforme
  GROUP BY (date(date_creation));


ALTER VIEW public.vue_stats_credits OWNER TO postgres;

--
-- TOC entry 4802 (class 2604 OID 24602)
-- Name: avis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avis ALTER COLUMN id SET DEFAULT nextval('public.avis_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 24679)
-- Name: credits_plateforme id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits_plateforme ALTER COLUMN id SET DEFAULT nextval('public.credits_plateforme_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 32873)
-- Name: preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferences ALTER COLUMN id SET DEFAULT nextval('public.preferences_id_seq'::regclass);


--
-- TOC entry 4805 (class 2604 OID 24621)
-- Name: preferences_custom id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferences_custom ALTER COLUMN id SET DEFAULT nextval('public.preferences_custom_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 24580)
-- Name: reservations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 32775)
-- Name: signalements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signalements ALTER COLUMN id SET DEFAULT nextval('public.signalements_id_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 32833)
-- Name: trajets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trajets ALTER COLUMN id SET DEFAULT nextval('public.trajets_id_seq'::regclass);


--
-- TOC entry 4790 (class 2604 OID 16424)
-- Name: utilisateurs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs ALTER COLUMN id SET DEFAULT nextval('public.utilisateurs_id_seq'::regclass);


--
-- TOC entry 4812 (class 2604 OID 32819)
-- Name: vehicules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicules ALTER COLUMN id SET DEFAULT nextval('public.vehicules_id_seq'::regclass);


--
-- TOC entry 5020 (class 0 OID 24599)
-- Dependencies: 222
-- Data for Name: avis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avis (id, reservation_id, note, commentaire, date_creation, statut) FROM stdin;
1	2	5	gdrgdrgdrgdrgdrgdrgdrgr avis1	2025-02-13 13:30:13.784784	en_attente
4	1	4	dzdqzdqzdqzdqz	2025-02-13 15:22:48.119325	en_attente
\.


--
-- TOC entry 5024 (class 0 OID 24676)
-- Dependencies: 226
-- Data for Name: credits_plateforme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credits_plateforme (id, trajet_id, montant, date_transaction, date_creation) FROM stdin;
\.


--
-- TOC entry 5032 (class 0 OID 32870)
-- Dependencies: 235
-- Data for Name: preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preferences (id, nom, created_at) FROM stdin;
1	Non-fumeur	2025-02-18 23:40:34.411551
2	Animaux acceptés	2025-02-18 23:40:34.411551
3	Musique	2025-02-18 23:40:34.411551
4	Discussion	2025-02-18 23:40:34.411551
5	Silence apprécié	2025-02-18 23:40:34.411551
6	Climatisation	2025-02-18 23:40:34.411551
7	Bagages encombrants acceptés	2025-02-18 23:40:34.411551
\.


--
-- TOC entry 5022 (class 0 OID 24618)
-- Dependencies: 224
-- Data for Name: preferences_custom; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preferences_custom (id, conducteur_id, description) FROM stdin;
\.


--
-- TOC entry 5018 (class 0 OID 24577)
-- Dependencies: 220
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, trajet_id, passager_id, date_reservation, statut, prix_total, nombre_places) FROM stdin;
1	60	3	2025-02-13 12:31:17.427552	en_attente	38.00	1
2	61	3	2025-02-13 12:59:40.164896	en_attente	120.00	3
3	59	3	2025-02-13 15:29:48.971466	en_attente	32.00	1
\.


--
-- TOC entry 5026 (class 0 OID 32772)
-- Dependencies: 228
-- Data for Name: signalements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.signalements (id, trajet_id, passager_id, description, date_signalement, statut, resolution_commentaire) FROM stdin;
\.


--
-- TOC entry 5030 (class 0 OID 32830)
-- Dependencies: 233
-- Data for Name: trajets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trajets (id, conducteur_id, vehicule_id, depart, arrivee, date_depart, date_arrivee, prix, places_totales, places_restantes, est_ecologique, commentaire, created_at) FROM stdin;
1	18	7	Limoges	Paris	2025-02-18 10:30:00	2025-02-18 13:30:00	40.00	3	3	t	Interdit aux chiens	2025-02-18 15:58:05.224896
2	1	\N	Paris	Lyon	2024-03-15 08:00:00	2024-03-15 11:00:00	25.00	4	4	t	Voyage confortable en Tesla	2025-02-19 01:42:47.875741
4	18	\N	Limoges	Paris	2024-03-20 10:30:00	2024-03-20 14:30:00	40.00	3	3	t	Interdit aux chiens	2025-02-19 01:42:47.875741
5	18	\N	Paris	Limoges	2024-03-22 16:00:00	2024-03-22 20:00:00	35.00	4	4	t	Retour tranquille	2025-02-19 01:42:47.875741
6	2	\N	Bordeaux	Toulouse	2024-03-18 09:00:00	2024-03-18 11:30:00	22.00	3	3	f	Musique ambiance	2025-02-19 01:42:47.875741
7	3	\N	Nantes	Rennes	2024-03-19 07:30:00	2024-03-19 09:00:00	15.00	4	4	t	Trajet quotidien	2025-02-19 01:42:47.875741
3	1	\N	Lyon	Marseille	2024-03-16 14:00:00	2024-03-16 16:30:00	20.00	3	2	f	Petite pause à Avignon	2025-02-19 01:42:47.875741
8	1	\N	Paris	Lyon	2024-03-15 08:00:00	2024-03-15 11:00:00	25.00	4	4	t	Voyage confortable	2025-02-19 01:56:20.550248
9	1	\N	Lyon	Marseille	2024-03-16 14:00:00	2024-03-16 16:30:00	20.00	3	3	t	Petite pause prévue	2025-02-19 01:56:20.550248
\.


--
-- TOC entry 5033 (class 0 OID 32879)
-- Dependencies: 236
-- Data for Name: utilisateur_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utilisateur_preferences (utilisateur_id, preference_id, created_at) FROM stdin;
\.


--
-- TOC entry 5016 (class 0 OID 16421)
-- Dependencies: 218
-- Data for Name: utilisateurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utilisateurs (id, pseudo, email, password, photo_url, note, date_inscription, nombre_avis, type_utilisateur, credits, role, statut, date_creation) FROM stdin;
1	test	test@test.com	$2a$10$0cFh42ZanDlPlSL1IQt31ejnlRE/yM8hTvr3M08Oz0dTdZ8Sac0nW	\N	5.0	2025-02-11 14:08:30.507502	0	passager	20	utilisateur	actif	2025-02-14 22:16:21.706075
3	arthur1	arthur1@test.com	$2a$10$hmZadFOrJzZFkQRDAoxgA.SEL859WiS85AOAgjSC4x0jcWkNoUCg.	\N	5.0	2025-02-13 11:12:34.268118	0	passager	20	utilisateur	actif	2025-02-14 22:16:21.706075
2	test1	test1@test.com	$2a$10$7oLcEojXWb7VbnM8zEolauzS8XXRbl5McfiThHsEkXjKMNkz7CfyK	\N	4.5	2025-02-13 10:13:59.295969	2	passager	20	utilisateur	actif	2025-02-14 22:16:21.706075
4	arthur789	arthur789@test.com	$2a$10$kdLQVspn0Gz4876q3HChJ.7QCQiiY5aediTc2ogIwTnTumjYXFWqG	\N	5.0	2025-02-13 17:39:31.722417	0	passager	20	utilisateur	actif	2025-02-14 22:16:21.706075
5	manon123	manon@test.com	$2a$10$6A1G0XfY3ekUyDkHGE4gKu/..96smm/BA8FIjUpUO11.hrmEuBU0m	\N	5.0	2025-02-14 13:49:36.839162	0	passager	20	utilisateur	actif	2025-02-14 22:16:21.706075
18	admin	admin@ecoride.fr	$2a$10$wXTJ2qGc8eu7LwjhkBa98.KVc5FSK8ksk1L8UIe9l6v1zEygZ.JLm	\N	5.0	2025-02-15 11:46:40.210067	0	passager	999	admin	actif	2025-02-15 11:46:40.210067
\.


--
-- TOC entry 5028 (class 0 OID 32816)
-- Dependencies: 231
-- Data for Name: vehicules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicules (id, conducteur_id, marque, modele, annee, places, est_ecologique, created_at) FROM stdin;
1	1	Tesla	Model 3	2022	5	t	2025-02-18 15:17:30.956172
2	1	Toyota	Prius	2021	5	t	2025-02-18 15:17:30.956172
3	1	Renault	Zoe	2020	5	t	2025-02-18 15:17:30.956172
4	1	Volkswagen	Golf	2019	5	f	2025-02-18 15:17:30.956172
5	1	Peugeot	308	2020	5	f	2025-02-18 15:17:30.956172
6	1	Renault	Clio	2021	5	f	2025-02-18 15:17:30.956172
7	18	Tesla	Model 3	2022	5	t	2025-02-18 15:28:55.537425
8	18	Renault	Zoe	2021	5	t	2025-02-18 15:28:55.537425
9	18	Peugeot	e-208	2022	5	t	2025-02-18 15:28:55.537425
10	18	Toyota	Prius	2020	5	t	2025-02-18 15:28:55.537425
11	18	Volkswagen	ID.3	2021	5	t	2025-02-18 15:28:55.537425
\.


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 221
-- Name: avis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.avis_id_seq', 7, true);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 225
-- Name: credits_plateforme_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credits_plateforme_id_seq', 1, false);


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 223
-- Name: preferences_custom_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preferences_custom_id_seq', 1, false);


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 234
-- Name: preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preferences_id_seq', 7, true);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 219
-- Name: reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservations_id_seq', 3, true);


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 227
-- Name: signalements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.signalements_id_seq', 1, false);


--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 232
-- Name: trajets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trajets_id_seq', 9, true);


--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 217
-- Name: utilisateurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilisateurs_id_seq', 18, true);


--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 230
-- Name: vehicules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicules_id_seq', 11, true);


--
-- TOC entry 4839 (class 2606 OID 24608)
-- Name: avis avis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT avis_pkey PRIMARY KEY (id);


--
-- TOC entry 4841 (class 2606 OID 24610)
-- Name: avis avis_reservation_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT avis_reservation_id_key UNIQUE (reservation_id);


--
-- TOC entry 4846 (class 2606 OID 24682)
-- Name: credits_plateforme credits_plateforme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits_plateforme
    ADD CONSTRAINT credits_plateforme_pkey PRIMARY KEY (id);


--
-- TOC entry 4844 (class 2606 OID 24623)
-- Name: preferences_custom preferences_custom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferences_custom
    ADD CONSTRAINT preferences_custom_pkey PRIMARY KEY (id);


--
-- TOC entry 4855 (class 2606 OID 32878)
-- Name: preferences preferences_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferences
    ADD CONSTRAINT preferences_nom_key UNIQUE (nom);


--
-- TOC entry 4857 (class 2606 OID 32876)
-- Name: preferences preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferences
    ADD CONSTRAINT preferences_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 24584)
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 4837 (class 2606 OID 24586)
-- Name: reservations reservations_trajet_id_passager_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_trajet_id_passager_id_key UNIQUE (trajet_id, passager_id);


--
-- TOC entry 4849 (class 2606 OID 32782)
-- Name: signalements signalements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signalements
    ADD CONSTRAINT signalements_pkey PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 32839)
-- Name: trajets trajets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trajets
    ADD CONSTRAINT trajets_pkey PRIMARY KEY (id);


--
-- TOC entry 4859 (class 2606 OID 32884)
-- Name: utilisateur_preferences utilisateur_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur_preferences
    ADD CONSTRAINT utilisateur_preferences_pkey PRIMARY KEY (utilisateur_id, preference_id);


--
-- TOC entry 4829 (class 2606 OID 16434)
-- Name: utilisateurs utilisateurs_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_key UNIQUE (email);


--
-- TOC entry 4831 (class 2606 OID 16430)
-- Name: utilisateurs utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 16432)
-- Name: utilisateurs utilisateurs_pseudo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pseudo_key UNIQUE (pseudo);


--
-- TOC entry 4851 (class 2606 OID 32823)
-- Name: vehicules vehicules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicules
    ADD CONSTRAINT vehicules_pkey PRIMARY KEY (id);


--
-- TOC entry 4842 (class 1259 OID 32802)
-- Name: idx_avis_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_avis_statut ON public.avis USING btree (statut);


--
-- TOC entry 4847 (class 1259 OID 32803)
-- Name: idx_signalements_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_signalements_date ON public.signalements USING btree (date_signalement);


--
-- TOC entry 4827 (class 1259 OID 32798)
-- Name: idx_utilisateurs_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_utilisateurs_statut ON public.utilisateurs USING btree (statut);


--
-- TOC entry 4861 (class 2606 OID 24611)
-- Name: avis avis_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT avis_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id);


--
-- TOC entry 4862 (class 2606 OID 24624)
-- Name: preferences_custom preferences_custom_conducteur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferences_custom
    ADD CONSTRAINT preferences_custom_conducteur_id_fkey FOREIGN KEY (conducteur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4860 (class 2606 OID 24592)
-- Name: reservations reservations_passager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_passager_id_fkey FOREIGN KEY (passager_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4863 (class 2606 OID 32788)
-- Name: signalements signalements_passager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signalements
    ADD CONSTRAINT signalements_passager_id_fkey FOREIGN KEY (passager_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4865 (class 2606 OID 32840)
-- Name: trajets trajets_conducteur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trajets
    ADD CONSTRAINT trajets_conducteur_id_fkey FOREIGN KEY (conducteur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4866 (class 2606 OID 32845)
-- Name: trajets trajets_vehicule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trajets
    ADD CONSTRAINT trajets_vehicule_id_fkey FOREIGN KEY (vehicule_id) REFERENCES public.vehicules(id);


--
-- TOC entry 4867 (class 2606 OID 32890)
-- Name: utilisateur_preferences utilisateur_preferences_preference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur_preferences
    ADD CONSTRAINT utilisateur_preferences_preference_id_fkey FOREIGN KEY (preference_id) REFERENCES public.preferences(id) ON DELETE CASCADE;


--
-- TOC entry 4868 (class 2606 OID 32885)
-- Name: utilisateur_preferences utilisateur_preferences_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur_preferences
    ADD CONSTRAINT utilisateur_preferences_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- TOC entry 4864 (class 2606 OID 32824)
-- Name: vehicules vehicules_conducteur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicules
    ADD CONSTRAINT vehicules_conducteur_id_fkey FOREIGN KEY (conducteur_id) REFERENCES public.utilisateurs(id);


-- Completed on 2025-02-19 03:49:32

--
-- PostgreSQL database dump complete
--

