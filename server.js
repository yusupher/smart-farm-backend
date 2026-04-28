const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

let token = null;
let tokenTime = 0;

async function getToken(){

 if(token && Date.now() - tokenTime < 3600000){
   return token;
 }

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
}

app.get("/soil", async (req,res)=>{

 const {lat,lon} = req.query;

 const t = await getToken();

 const r = await fetch(
   `https://api.isda-africa.com/isdasoil/v2/soilproperty?lat=${lat}&lon=${lon}&property=ph`,
   {
     headers:{
       Authorization:"Bearer "+t
     }
   }
 );

 const d = await r.json();

 res.json({
   ph: d.property.ph[0].value.value
 });

});

app.listen(3000,()=>{
  console.log("Smart Farm backend running");
});
