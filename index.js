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
const articleRoutes = require("./routes/Articles/Articles");
const chatRoutes = require("./routes/Chats/chatRoutes");
const cron = require("node-cron");
const Chat = require("./models/Chats/Chat");

const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);

// Set up socket.io for real time communication
let users = {}; // To store the connected users

app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.options("*", cors());

app.use(express.json());

const api = process.env.API_URL;
const port = process.env.PORT;

// app.use(cors());
// app.options("*", cors());

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use((req, res, next) => {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://execute-partner.vercel.app/"
//   ); // Replace with your frontend's origin
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// const allowedOrigins = [
//   "https://execute-partner.vercel.app",
//   "https://execute-partners.vercel.app",
//   "https://execute-partner-admin.vercel.app",
//   "https://execute-partners-admin.vercel.app",
// ];

// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   if (allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//   } else {
//     res.header("Access-Control-Allow-Origin", "*"); // You can set "*" if you want to allow all origins
//   }

//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

//   next();
// });

// app.use(cors());
// app.options("*", cors());

app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));

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
app.use(`${api}/articles`, articleRoutes);
app.use(`${api}/chat`, chatRoutes);

// To handle a new connection
io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // Add debug logging for all events
  socket.onAny((event, ...args) => {
    console.log(`[${socket.id}] Received event: ${event}`, args);
  });

  // Add user to users object
  socket.on("register", (userId) => {
    console.log(`Registering user: ${userId} to socket: ${socket.id}`);
    users[userId] = socket.id;
  });

  // Listen for incoming messages
  socket.on("send_message", async (data) => {
    console.log(`Received message from ${socket.id}:`, data);
    
    try {
      const { senderId, receiverId, message } = data;
      const chat = new Chat({ sender: senderId, receiver: receiverId, message });
      await chat.save();
      console.log("Message saved to DB");

      // Emit to receiver if connected
      if (users[receiverId]) {
        io.to(users[receiverId]).emit("receive_message", {
          senderId,
          message,
          timestamp: chat.timestamp
        });
        console.log(`Message forwarded to ${receiverId}`);
      } else {
        console.log(`Receiver ${receiverId} not connected`);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // Handle Disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`Removed user: ${userId}`);
        break;
      }
    }
  });
});

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

// Start the cron job
cron.schedule("0 */6 * * *", () => {
  console.log("Fetching and storing news...");
  fetchAndStoreNewsForAllCategories();
});

//  cron.schedule("*/1 * * * *", () => {
//   fetchAndStoreNewsForAllCategories();
//   console.log("Fetching and storing news...");
// });

server.listen(port, () => {
  console.log(`Server is runinng on port ${port}`);
});
