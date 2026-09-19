export interface IndianState {
  code: string;
  name: string;
  unionTerritory: boolean;
  /** Major districts. Not exhaustive — the UI always offers manual entry.
   *  Source: state government portals; extend from Census data as needed. */
  districts: string[];
}

export const INDIAN_STATES: IndianState[] = [
  { code: "AP", name: "Andhra Pradesh", unionTerritory: false, districts: ["Visakhapatnam", "Vijayawada (NTR)", "Guntur", "Tirupati", "Kurnool", "Rajahmundry (East Godavari)"] },
  { code: "AR", name: "Arunachal Pradesh", unionTerritory: false, districts: ["Itanagar (Papum Pare)", "Tawang"] },
  { code: "AS", name: "Assam", unionTerritory: false, districts: ["Kamrup Metro (Guwahati)", "Dibrugarh", "Cachar (Silchar)", "Jorhat", "Nagaon"] },
  { code: "BR", name: "Bihar", unionTerritory: false, districts: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"] },
  { code: "CT", name: "Chhattisgarh", unionTerritory: false, districts: ["Raipur", "Bilaspur", "Durg", "Korba", "Raigarh"] },
  { code: "GA", name: "Goa", unionTerritory: false, districts: ["North Goa", "South Goa"] },
  { code: "GJ", name: "Gujarat", unionTerritory: false, districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar", "Anand", "Kutch"] },
  { code: "HR", name: "Haryana", unionTerritory: false, districts: ["Gurugram", "Faridabad", "Ambala", "Hisar", "Karnal", "Panipat", "Rohtak"] },
  { code: "HP", name: "Himachal Pradesh", unionTerritory: false, districts: ["Shimla", "Kangra", "Mandi", "Solan", "Hamirpur", "Una"] },
  { code: "JH", name: "Jharkhand", unionTerritory: false, districts: ["Ranchi", "East Singhbhum (Jamshedpur)", "Dhanbad", "Bokaro", "Hazaribagh"] },
  { code: "KA", name: "Karnataka", unionTerritory: false, districts: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Dakshina Kannada (Mangaluru)", "Belagavi", "Dharwad (Hubballi)", "Kalaburagi", "Ballari", "Tumakuru", "Shivamogga"] },
  { code: "KL", name: "Kerala", unionTerritory: false, districts: ["Thiruvananthapuram", "Kollam", "Ernakulam (Kochi)", "Thrissur", "Kozhikode", "Kannur", "Palakkad", "Malappuram", "Kottayam", "Alappuzha"] },
  { code: "MP", name: "Madhya Pradesh", unionTerritory: false, districts: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Rewa", "Sagar"] },
  { code: "MH", name: "Maharashtra", unionTerritory: false, districts: ["Mumbai City", "Mumbai Suburban", "Thane", "Pune", "Nagpur", "Nashik", "Chh. Sambhajinagar (Aurangabad)", "Solapur", "Kolhapur", "Satara", "Ahilyanagar (Ahmednagar)", "Jalgaon", "Amravati", "Latur", "Nanded"] },
  { code: "MN", name: "Manipur", unionTerritory: false, districts: ["Imphal West", "Imphal East"] },
  { code: "ML", name: "Meghalaya", unionTerritory: false, districts: ["East Khasi Hills (Shillong)", "West Garo Hills (Tura)"] },
  { code: "MZ", name: "Mizoram", unionTerritory: false, districts: ["Aizawl"] },
  { code: "NL", name: "Nagaland", unionTerritory: false, districts: ["Dimapur", "Kohima"] },
  { code: "OD", name: "Odisha", unionTerritory: false, districts: ["Khordha (Bhubaneswar)", "Cuttack", "Sundargarh (Rourkela)", "Sambalpur", "Puri", "Ganjam (Berhampur)"] },
  { code: "PB", name: "Punjab", unionTerritory: false, districts: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "S.A.S. Nagar (Mohali)"] },
  { code: "RJ", name: "Rajasthan", unionTerritory: false, districts: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bharatpur", "Sikar", "Pali", "Bhilwara", "Sri Ganganagar", "Chittorgarh", "Jaisalmer", "Barmer", "Jhunjhunu", "Nagaur", "Tonk", "Sawai Madhopur", "Churu", "Banswara", "Dausa", "Sirohi"] },
  { code: "SK", name: "Sikkim", unionTerritory: false, districts: ["Gangtok", "Namchi"] },
  { code: "TN", name: "Tamil Nadu", unionTerritory: false, districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Kanchipuram", "Chengalpattu"] },
  { code: "TG", name: "Telangana", unionTerritory: false, districts: ["Hyderabad", "Medchal–Malkajgiri", "Rangareddy", "Sangareddy", "Warangal", "Karimnagar", "Nizamabad", "Khammam", "Nalgonda", "Mahbubnagar"] },
  { code: "TR", name: "Tripura", unionTerritory: false, districts: ["West Tripura (Agartala)"] },
  { code: "UP", name: "Uttar Pradesh", unionTerritory: false, districts: ["Lucknow", "Kanpur Nagar", "Varanasi", "Agra", "Prayagraj", "Meerut", "Ghaziabad", "Gautam Buddha Nagar (Noida)", "Bareilly", "Gorakhpur", "Aligarh", "Moradabad"] },
  { code: "UK", name: "Uttarakhand", unionTerritory: false, districts: ["Dehradun", "Haridwar", "Nainital", "Udham Singh Nagar", "Pauri Garhwal", "Almora"] },
  { code: "WB", name: "West Bengal", unionTerritory: false, districts: ["Kolkata", "Howrah", "Hooghly", "North 24 Parganas", "South 24 Parganas", "Darjeeling", "Jalpaiguri", "Purba Bardhaman", "Nadia", "Malda"] },
  { code: "AN", name: "Andaman & Nicobar", unionTerritory: true, districts: ["South Andaman (Port Blair)"] },
  { code: "CH", name: "Chandigarh", unionTerritory: true, districts: ["Chandigarh"] },
  { code: "DN", name: "Dadra & Nagar Haveli and Daman & Diu", unionTerritory: true, districts: ["Dadra and Nagar Haveli", "Daman", "Diu"] },
  { code: "DL", name: "Delhi", unionTerritory: true, districts: ["New Delhi", "Central Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara"] },
  { code: "JK", name: "Jammu & Kashmir", unionTerritory: true, districts: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua"] },
  { code: "LA", name: "Ladakh", unionTerritory: true, districts: ["Leh", "Kargil"] },
  { code: "LD", name: "Lakshadweep", unionTerritory: true, districts: ["Kavaratti"] },
  { code: "PY", name: "Puducherry", unionTerritory: true, districts: ["Puducherry", "Karaikal"] },
];

export const indianStateByCode = (code: string): IndianState | undefined =>
  INDIAN_STATES.find((s) => s.code === code.toUpperCase());

export const districtsForState = (stateCode: string): string[] =>
  indianStateByCode(stateCode)?.districts ?? [];
