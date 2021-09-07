--
-- PostgreSQL database dump
--
--
-- Data for Name: atd_txdot_geocoders; Type: TABLE DATA; Schema: public; Owner: atd_vz_data
--

INSERT INTO public.atd_txdot_geocoders VALUES (1, 'HERE', 'This is the HERE.com geocoder, we get around 250k free lookups per month.');
INSERT INTO public.atd_txdot_geocoders VALUES (2, 'Google Maps', 'Google maps geocoder');
INSERT INTO public.atd_txdot_geocoders VALUES (4, 'ESRI', 'ESRI GeoCoder');
INSERT INTO public.atd_txdot_geocoders VALUES (3, 'Texas A&M', 'Texas A&M GeoCoder');
INSERT INTO public.atd_txdot_geocoders VALUES (0, 'CRIS', 'Original Coordinates from CRIS Data');
INSERT INTO public.atd_txdot_geocoders VALUES (5, 'Manual Q/A', 'The lat/long coordinates have been provided manually.');


--
-- Name: atd_txdot_geocoders_geocoder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atd_vz_data
--

SELECT pg_catalog.setval('public.atd_txdot_geocoders_geocoder_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

