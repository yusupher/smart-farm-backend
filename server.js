const express = require("express");
const cors = require("cors");

const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET","POST"]
}));

let token = null;
let tokenTime = 0;

// ===== GET TOKEN =====
async function getToken(){

  if(token && Date.now() - tokenTime < 3600000){
    return token;
  }

  try {

    const form = new URLSearchParams();
    form.append("grant_type","password");
    form.append("username","yusuf.abdulkareem@kwasu.edu.ng");
    form.append("password","Yusupher@01");

    const res = await fetch("https://api.isda-africa.com/login",{
      method:"POST",
      headers:{
        "Content-Type":"application/x-www-form-urlencoded"
      },
      body:form
    });

    const data = await res.json();

    token = data.access_token;
    tokenTime = Date.now();

    return token;

  } catch (err) {
    console.log("Token error:", err);
    return null;
  }
}

// ===== SOIL ENDPOINT =====
app.get("/soil", async (req,res)=>{

  try {

    const {lat,lon} = req.query;

    const t = await getToken();

    if(!t){
      return res.json({ ph: 6.5, note: "no token" });
    }

    const r = await fetch(
      `https://api.isda-africa.com/isdasoil/v2/soilproperty?lat=${lat}&lon=${lon}&property=ph`,
      {
        headers:{
          Authorization:"Bearer "+t
        }
      }
    );

    const d = await r.json();

    const ph = d?.property?.ph?.[0]?.value?.value;

    res.json({ ph: ph || 6.5 });

  } catch (err) {
    console.log("Soil error:", err);
    res.json({ ph: 6.5, note: "error fallback" });
  }

});

// ===== HOME =====
app.get("/", (req,res)=>{
  res.send("🌾 Smart Farm Backend Running");
});

// ===== START =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log("Backend running on", PORT);
});
