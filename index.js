require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const aboutRoutes = require("./routes/About/AboutHerosectionRoutes");
const leadershipRoutes = require("./routes/About/LeadershipSectionRoutes");
const keyPillarRoutes = require("./routes/About/KeyPillarSectionRoutes");
const teamAdvisorRoutes = require("./routes/About/TeamSectionRoutes");
const partnerRoutes = require("./routes/About/PartnerSectionRoutes");
const principleRoutes = require("./routes/About/PrincipleSectionRoutes");
const practiceCardRoutes = require("./routes/Practice/PracticeMainSectionRoutes");
const transformationCardRoutes = require("./routes/Practice/TransformationCardRoutes");
const greenCardRoutes = require("./routes/Practice/GreenCardRoutes");
const technologySectionRoutes = require("./routes/Practice/TechnologySectionRoutes");
const yellowCardRoutes = require("./routes/Practice/YellowCardRoutes");
const complianceSectionRoutes = require("./routes/Practice/ComplianceSectionRoutes");
const redCardRoutes = require("./routes/Practice/RedCardRoutes");
const treasuryImplementation = require("./routes/Practice/treasuryImplementation");
const digitalRoutes = require("./routes/Practice/digitalRoutes");
const careerRoutes = require("./routes/Career/CareerRoutes");
const insightRoutes = require("./routes/Insight/InsightRoutes");
const newsRoutes = require("./routes/News/NewsRouts");
const contactUsRoutes = require("./routes/Contact Us/ContactUsRoutes");
const mailRoutes = require("./routes/Mail/Mail");
const CallToPartnerRoute = require("./routes/About/CallToPartnerRoutes");
const whyExecute = require("./routes/Home/whyExecuteRoutes");
const ComplienceSectionRoutes = require("./routes/Practice/compliences&Risk");
const PractiveHeroSectionRoute = require("./routes/Practice/PracticeHeroSectionRoute");
const Quote = require("./routes/Practice/quoteRoute");
const homeQuote = require("./routes/Home/quoteRoute");
const featureRoutes = require("./routes/Home/featureSectionRoutes");
const contactQuote = require("./routes/Contact Us/quoteRoute");
const PeopleRoute = require("./routes/Practice/peoplRoute");
const authRoutes = require("./routes/Auth/authRoutes");
const commentRoutes = require("./routes/comment/commentRoutes");
const pagesVideosRoute = require("./routes/SectionVideo/pageVideoRoutes");
const documentRoute = require("./routes/Document/document");
const fetchAndStoreNewsForAllCategories = require("./services/mediumService");
const cron = require("node-cron");

const app = express();
app.use(express.json());

const api = process.env.API_URL;
const port = process.env.PORT;

app.use(cors());
app.options("*", cors());

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
const allowedOrigins = [
  "https://execute-partner.vercel.app/",
  "https://execute-partner-admin.vercel.app/",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Check if the incoming origin is in the allowedOrigins list
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Deny the request
      }
    },
    credentials: true,
  })
);
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade"); // Or another policy based on your needs
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(`${api}/auth`, authRoutes);
app.use(`${api}/about`, aboutRoutes);
app.use(`${api}/leadership`, leadershipRoutes);
app.use(`${api}/key-pillars`, keyPillarRoutes);
app.use(`${api}/team`, teamAdvisorRoutes);
app.use(`${api}/partner`, partnerRoutes);
app.use(`${api}/principle`, principleRoutes);
app.use(`${api}/people`, PeopleRoute);
app.use(`${api}/practice-main`, practiceCardRoutes);
app.use(`${api}/tansformation-card`, transformationCardRoutes);
app.use(`${api}/treasuryImplementation-card`, treasuryImplementation);
app.use(`${api}/digital`, digitalRoutes);
app.use(`${api}/green-card`, greenCardRoutes);
app.use(`${api}/technology-section`, technologySectionRoutes);
app.use(`${api}/yellow-card`, yellowCardRoutes);
app.use(`${api}/compliance-section`, complianceSectionRoutes);
app.use(`${api}/red-card`, redCardRoutes);
app.use(`${api}/complience&risk-section`, ComplienceSectionRoutes);
app.use(`${api}/practiceHerosection`, PractiveHeroSectionRoute);
app.use(`${api}/career`, careerRoutes);
app.use(`${api}/insight`, insightRoutes);
app.use(`${api}/comment`, commentRoutes);
app.use(`${api}/news`, newsRoutes);
app.use(`${api}/contactus`, contactUsRoutes, contactQuote);
app.use(`${api}/emails`, mailRoutes);
app.use(`${api}/call-to-partner`, CallToPartnerRoute);
app.use(`${api}/why-execute`, whyExecute);
app.use(`${api}/practice`, Quote);
app.use(`${api}/home`, homeQuote, featureRoutes);
app.use(`${api}/section`, pagesVideosRoute);
app.use(`${api}/document`, documentRoute);

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

// Start the cron job
cron.schedule("0 */8 * * *", () => {
  console.log("Fetching and storing news...");
  fetchAndStoreNewsForAllCategories();
});
app.listen(port, () => {
  console.log(`Server is runinng on port ${port}`);
});
