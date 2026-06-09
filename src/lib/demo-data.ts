const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
const inFiveDays = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
const inSevenDays = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
const inTenDays = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);

export const DEMO_ROOMS = [
  { id: "r1", number: "101", floor: 1, category: "standard", price_per_night: 35000, status: "occupied" },
  { id: "r2", number: "102", floor: 1, category: "standard", price_per_night: 35000, status: "available" },
  { id: "r3", number: "103", floor: 1, category: "standard", price_per_night: 35000, status: "cleaning" },
  { id: "r4", number: "201", floor: 2, category: "deluxe", price_per_night: 55000, status: "occupied" },
  { id: "r5", number: "202", floor: 2, category: "deluxe", price_per_night: 55000, status: "available" },
  { id: "r6", number: "203", floor: 2, category: "deluxe", price_per_night: 55000, status: "reserved" },
  { id: "r7", number: "301", floor: 3, category: "suite", price_per_night: 95000, status: "occupied" },
  { id: "r8", number: "302", floor: 3, category: "suite", price_per_night: 95000, status: "available" },
  { id: "r9", number: "401", floor: 4, category: "apartment", price_per_night: 120000, status: "occupied" },
  { id: "r10", number: "402", floor: 4, category: "apartment", price_per_night: 120000, status: "maintenance" },
];

export const DEMO_RESERVATIONS = [
  { id: "res1", guest_name: "Jean-Pierre Kamga", guest_phone: "+237 699 123 456", guest_email: "jpkamga@gmail.com", room_id: "r1", check_in: yesterday, check_out: inFiveDays, total_amount: 175000, status: "checked_in", rooms: { number: "101", category: "standard" } },
  { id: "res2", guest_name: "Marie-Claire Ndong", guest_phone: "+237 677 890 123", guest_email: "mcndong@yahoo.fr", room_id: "r4", check_in: twoDaysAgo, check_out: inTwoDays, total_amount: 220000, status: "checked_in", rooms: { number: "201", category: "deluxe" } },
  { id: "res3", guest_name: "Patrick Essomba", guest_phone: "+237 655 456 789", guest_email: "pessomba@outlook.com", room_id: "r7", check_in: today, check_out: inSevenDays, total_amount: 665000, status: "confirmed", rooms: { number: "301", category: "suite" } },
  { id: "res4", guest_name: "Aminata Diallo", guest_phone: "+33 6 12 34 56 78", guest_email: "aminata.d@gmail.com", room_id: "r9", check_in: threeDaysAgo, check_out: inTwoDays, total_amount: 600000, status: "checked_in", rooms: { number: "401", category: "apartment" } },
  { id: "res5", guest_name: "Thomas Mbarga", guest_phone: "+237 690 111 222", guest_email: "tmbarga@gmail.com", room_id: "r6", check_in: inTwoDays, check_out: inTenDays, total_amount: 440000, status: "confirmed", rooms: { number: "203", category: "deluxe" } },
  { id: "res6", guest_name: "Sophie Atangana", guest_phone: "+237 678 333 444", guest_email: null, room_id: "r2", check_in: threeDaysAgo, check_out: yesterday, total_amount: 70000, status: "checked_out", rooms: { number: "102", category: "standard" } },
  { id: "res7", guest_name: "David Tchoupo", guest_phone: "+237 691 555 666", guest_email: "dtchoupo@gmail.com", room_id: "r5", check_in: inFiveDays, check_out: inTenDays, total_amount: 275000, status: "confirmed", rooms: { number: "202", category: "deluxe" } },
];

export const DEMO_HOUSEKEEPING = [
  { id: "hk1", room_id: "r3", assigned_to: "Jeanne Meka", notes: "Nettoyage complet après check-out", status: "in_progress", quality_score: null, created_at: today, rooms: { number: "103", category: "standard", floor: 1 } },
  { id: "hk2", room_id: "r2", assigned_to: "Pauline Ngo", notes: null, status: "done", quality_score: 92, created_at: yesterday, rooms: { number: "102", category: "standard", floor: 1 } },
  { id: "hk3", room_id: "r5", assigned_to: "Jeanne Meka", notes: "Changer les draps suite demande client", status: "pending", quality_score: null, created_at: today, rooms: { number: "202", category: "deluxe", floor: 2 } },
  { id: "hk4", room_id: "r8", assigned_to: "Pauline Ngo", notes: "Préparation VIP", status: "pending", quality_score: null, created_at: today, rooms: { number: "302", category: "suite", floor: 3 } },
  { id: "hk5", room_id: "r6", assigned_to: "Jeanne Meka", notes: null, status: "inspected", quality_score: 88, created_at: twoDaysAgo, rooms: { number: "203", category: "deluxe", floor: 2 } },
  { id: "hk6", room_id: "r7", assigned_to: "Pauline Ngo", notes: "Réapprovisionnement minibar", status: "done", quality_score: 95, created_at: yesterday, rooms: { number: "301", category: "suite", floor: 3 } },
];

export const DEMO_MAINTENANCE = [
  { id: "mt1", title: "Climatisation en panne", description: "Le climatiseur de la chambre 201 ne refroidit plus", room_id: "r4", priority: "high", status: "in_progress", assigned_to: "Michel Fouda", created_at: yesterday, rooms: { number: "201", floor: 2 } },
  { id: "mt2", title: "Fuite robinet salle de bain", description: "Fuite au niveau du lavabo, goutte à goutte", room_id: "r10", priority: "urgent", status: "open", assigned_to: "Michel Fouda", created_at: today, rooms: { number: "402", floor: 4 } },
  { id: "mt3", title: "Ampoule grillée couloir 3e étage", description: null, room_id: null, priority: "low", status: "open", assigned_to: null, created_at: today, rooms: null },
  { id: "mt4", title: "Serrure électronique bloquée", description: "La carte ne fonctionne plus, client bloqué ce matin", room_id: "r7", priority: "urgent", status: "resolved", assigned_to: "Michel Fouda", created_at: threeDaysAgo, rooms: { number: "301", floor: 3 } },
  { id: "mt5", title: "TV ne s'allume plus", description: "Écran noir, télécommande neuve testée", room_id: "r1", priority: "medium", status: "open", assigned_to: "Jean-Marc Eba", created_at: today, rooms: { number: "101", floor: 1 } },
];

export const DEMO_CONSIGNES = [
  { id: "cs1", title: "Fermer le bar à 23h ce soir", body: "Événement privé demain matin, besoin de préparer la salle", priority: "important", target_role: "receptionist", status: "active", author_name: "Lionel M.", created_at: today },
  { id: "cs2", title: "VIP chambre 301 — M. Essomba", body: "Client fidèle, offrir une bouteille d'eau supplémentaire et des fruits frais à l'arrivée", priority: "urgent", target_role: "all", status: "active", author_name: "Lionel M.", created_at: today },
  { id: "cs3", title: "Vérifier les stocks de serviettes", body: "Commande prévue vendredi, faire l'inventaire avant", priority: "normal", target_role: "housekeeper", status: "active", author_name: "Ines D.", created_at: yesterday },
  { id: "cs4", title: "Réunion d'équipe vendredi 9h", body: "Salle de conférence RDC. Points : qualité, plannings, primes", priority: "normal", target_role: "all", status: "active", author_name: "Lionel M.", created_at: twoDaysAgo },
  { id: "cs5", title: "Piscine fermée pour maintenance", body: "Traitement chimique en cours jusqu'à demain 14h", priority: "important", target_role: "receptionist", status: "done", author_name: "Michel F.", created_at: threeDaysAgo },
];

export const DEMO_CASH_REGISTER = [
  { id: "cr1", amount: 175000, type: "in", description: "Paiement séjour Kamga J-P", category: "vente", created_at: today },
  { id: "cr2", amount: 35000, type: "in", description: "Restaurant table 4", category: "vente", created_at: today },
  { id: "cr3", amount: 12000, type: "out", description: "Achat produits ménage", category: "achat", created_at: today },
  { id: "cr4", amount: 220000, type: "in", description: "Paiement séjour Ndong M-C", category: "vente", created_at: yesterday },
  { id: "cr5", amount: 50000, type: "out", description: "Salaire journalier extra", category: "salaire", created_at: yesterday },
  { id: "cr6", amount: 8500, type: "out", description: "Taxi pour client VIP", category: "service", created_at: yesterday },
  { id: "cr7", amount: 95000, type: "in", description: "Location salle conférence", category: "service", created_at: twoDaysAgo },
  { id: "cr8", amount: 25000, type: "in", description: "Minibar chambres 201+301", category: "vente", created_at: twoDaysAgo },
  { id: "cr9", amount: 15000, type: "out", description: "Réparation télécommande TV", category: "autre", created_at: threeDaysAgo },
  { id: "cr10", amount: 600000, type: "in", description: "Paiement séjour Diallo A.", category: "vente", created_at: threeDaysAgo },
];

export const DEMO_LOST_FOUND = [
  { id: "lf1", item_name: "Portefeuille noir en cuir", description: "Contient des cartes de visite, pas d'argent", location: "Chambre 102", status: "stored", created_at: today },
  { id: "lf2", item_name: "Chargeur iPhone", description: "Câble Lightning blanc", location: "Restaurant", status: "stored", created_at: yesterday },
  { id: "lf3", item_name: "Lunettes de soleil Ray-Ban", description: "Monture noire, verres polarisés", location: "Piscine", status: "stored", created_at: twoDaysAgo },
  { id: "lf4", item_name: "Écharpe en soie bleue", description: null, location: "Lobby", status: "returned", created_at: threeDaysAgo },
  { id: "lf5", item_name: "Clé USB 32Go", description: "Marque SanDisk, rouge", location: "Salle de conférence", status: "stored", created_at: threeDaysAgo },
];

export const DEMO_LENT_ITEMS = [
  { id: "li1", item_name: "Fer à repasser", guest_name: "Marie-Claire Ndong", room: "201", quantity: 1, status: "lent", created_at: today, returned_at: null },
  { id: "li2", item_name: "Adaptateur universel", guest_name: "Patrick Essomba", room: "301", quantity: 1, status: "lent", created_at: today, returned_at: null },
  { id: "li3", item_name: "Oreiller supplémentaire", guest_name: "Aminata Diallo", room: "401", quantity: 2, status: "lent", created_at: yesterday, returned_at: null },
  { id: "li4", item_name: "Parapluie", guest_name: "Jean-Pierre Kamga", room: "101", quantity: 1, status: "lent", created_at: yesterday, returned_at: null },
  { id: "li5", item_name: "Rallonge électrique", guest_name: "Sophie Atangana", room: "102", quantity: 1, status: "returned", created_at: threeDaysAgo, returned_at: yesterday },
];

export const DEMO_QUALITY = [
  { id: "qc1", room: "Chambre 101", category: "chambre", score: 8, inspector_name: "Lionel M.", notes: "Bon état général, poussière sur le ventilateur", created_at: today },
  { id: "qc2", room: "Chambre 201", category: "chambre", score: 9, inspector_name: "Lionel M.", notes: "Excellente propreté", created_at: today },
  { id: "qc3", room: "Chambre 301", category: "suite", score: 10, inspector_name: "Ines D.", notes: "Parfait, prêt pour le VIP", created_at: yesterday },
  { id: "qc4", room: "Lobby", category: "parties_communes", score: 7, inspector_name: "Lionel M.", notes: "Vitres à nettoyer côté parking", created_at: yesterday },
  { id: "qc5", room: "Salle de bain 102", category: "salle_de_bain", score: 6, inspector_name: "Ines D.", notes: "Joints à refaire, miroir taché", created_at: twoDaysAgo },
  { id: "qc6", room: "Piscine", category: "exterieur", score: 9, inspector_name: "Lionel M.", notes: "Eau claire, transats propres", created_at: twoDaysAgo },
  { id: "qc7", room: "Chambre 402", category: "chambre", score: 4, inspector_name: "Ines D.", notes: "Moquette tachée, odeur humidité — maintenance requise", created_at: threeDaysAgo },
];

export const DEMO_CONTRACTS = [
  { id: "ct1", title: "Contrat ménage quotidien", provider: "CleanPro Services", type: "service", start_date: "2025-01-01", end_date: "2025-12-31", amount: 450000, status: "active" },
  { id: "ct2", title: "Maintenance climatisation", provider: "FroidTech SARL", type: "service", start_date: "2025-03-01", end_date: "2026-02-28", amount: 150000, status: "active" },
  { id: "ct3", title: "Fourniture linge de lit", provider: "TextilCam", type: "fournisseur", start_date: "2025-06-01", end_date: "2026-05-31", amount: 280000, status: "active" },
  { id: "ct4", title: "Assurance multirisque", provider: "Activa Assurances", type: "assurance", start_date: "2025-01-01", end_date: "2025-12-31", amount: 890000, status: "active" },
  { id: "ct5", title: "Sécurité 24/7", provider: "SecuriGuard Cameroun", type: "service", start_date: "2025-01-15", end_date: "2026-01-14", amount: 350000, status: "active" },
  { id: "ct6", title: "Internet fibre optique", provider: "Camtel", type: "service", start_date: "2024-09-01", end_date: "2025-08-31", amount: 85000, status: "active" },
  { id: "ct7", title: "Ancien contrat blanchisserie", provider: "LavoExpress", type: "service", start_date: "2024-01-01", end_date: "2024-12-31", amount: 200000, status: "terminated" },
];

export const DEMO_INVOICES = [
  { id: "inv1", amount: 175000, status: "paid", method: "mobile_money", paid_at: today, created_at: today, reservations: { guest_name: "Jean-Pierre Kamga", check_in: yesterday, check_out: inFiveDays } },
  { id: "inv2", amount: 220000, status: "paid", method: "card", paid_at: twoDaysAgo, created_at: twoDaysAgo, reservations: { guest_name: "Marie-Claire Ndong", check_in: twoDaysAgo, check_out: inTwoDays } },
  { id: "inv3", amount: 665000, status: "pending", method: null, paid_at: null, created_at: today, reservations: { guest_name: "Patrick Essomba", check_in: today, check_out: inSevenDays } },
  { id: "inv4", amount: 600000, status: "paid", method: "bank_transfer", paid_at: threeDaysAgo, created_at: threeDaysAgo, reservations: { guest_name: "Aminata Diallo", check_in: threeDaysAgo, check_out: inTwoDays } },
  { id: "inv5", amount: 440000, status: "pending", method: null, paid_at: null, created_at: today, reservations: { guest_name: "Thomas Mbarga", check_in: inTwoDays, check_out: inTenDays } },
  { id: "inv6", amount: 70000, status: "paid", method: "cash", paid_at: yesterday, created_at: threeDaysAgo, reservations: { guest_name: "Sophie Atangana", check_in: threeDaysAgo, check_out: yesterday } },
  { id: "inv7", amount: 275000, status: "pending", method: null, paid_at: null, created_at: today, reservations: { guest_name: "David Tchoupo", check_in: inFiveDays, check_out: inTenDays } },
];

export const DEMO_AGENDA = [
  { id: "ag1", title: "Check-in M. Essomba (VIP)", type: "checkin", date: today, time: "14:00", notes: "Suite 301, préparer accueil VIP" },
  { id: "ag2", title: "Réunion d'équipe", type: "meeting", date: inTwoDays, time: "09:00", notes: "Salle de conférence RDC" },
  { id: "ag3", title: "Livraison linge TextilCam", type: "delivery", date: today, time: "10:30", notes: "200 draps + 100 serviettes" },
  { id: "ag4", title: "Check-out Mme Ndong", type: "checkout", date: inTwoDays, time: "11:00", notes: "Chambre 201" },
  { id: "ag5", title: "Intervention FroidTech clim", type: "maintenance", date: inTwoDays, time: "15:00", notes: "Chambre 201 + 402" },
  { id: "ag6", title: "Check-in M. Mbarga", type: "checkin", date: inTwoDays, time: "16:00", notes: "Chambre 203 deluxe" },
  { id: "ag7", title: "Événement privé salon", type: "event", date: inFiveDays, time: "19:00", notes: "Anniversaire 30 pers, traiteur confirmé" },
];
