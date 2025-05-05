require("dotenv").config();
const News = require("../models/News/news");

const ALLOWED_CATEGORIES = [
  "Business Transformation",
  "Technology Services",
  "Regulatory Compliance & Risk",
  "Treasury Implementations",
  "People",
  "Digital",
];

// Fetch news from the Real-Time News Data API
const fetchNews = async (
  query,
  limit = 2,
  timePublished = "1d",
  lang = "en"
) => {
  const url = `https://real-time-news-data.p.rapidapi.com/search?query=${encodeURIComponent(
    query
  )}&limit=${limit}&time_published=${timePublished}&lang=${lang}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY, // Fetch from .env
      "x-rapidapi-host": process.env.RAPIDAPI_HOST, // Fetch from .env
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

// Filter news by category
const filterNewsByCategory = (newsData, category) => {
  return newsData?.filter((news) => {
    const title = news?.title?.toLowerCase();
    const snippet = news?.snippet?.toLowerCase();
    const categoryLower = category.toLowerCase();

    // Special handling for "People" category to filter HR-related news
    if (categoryLower === "people") {
      const hrKeywords = [
        "hr",
        "human resources",
        "recruitment",
        "employee",
        "workforce",
      ];
      return hrKeywords.some(
        (keyword) => title.includes(keyword) || snippet.includes(keyword)
      );
    }

    // Extended handling for "Digital" category to include AI-related keywords
    if (categoryLower === "digital") {
      const digitalKeywords = [
        "digital",
        "ai",
        "artificial intelligence",
        "machine learning",
        "deep learning",
        "automation",
        "generative ai",
        "large language model",
        "chatgpt",
      ];
      return digitalKeywords.some(
        (keyword) => title.includes(keyword) || snippet.includes(keyword)
      );
    }

    // General filtering for other categories
    return title.includes(categoryLower) || snippet.includes(categoryLower);
  });
};

// Store filtered news in the database
const storeNewsInDatabase = async (filteredNews, category) => {
  try {
    let news = await News.findOne();
    if (!news) {
      news = new News({ cards: [] });
    }

    for (const item of filteredNews) {
      const newsCard = {
        heading: item.title,
        headingLinks: [{ text: "Read more", url: item.link }],
        description: item.snippet,
        descriptionLinks: [],
        dateTime: item.published_datetime_utc,
        readDuration: "2 min read", // Default value
        imageUrl: item.source_logo_url,
        category: category,
        references: [{ title: item.source_name, url: item.link }],
        socialLinks: [],
        content: [
          {
            type: "paragraph",
            heading: "",
            headingLinks: [{ text: "Read more", url: item.link }],
            description: "",
            descriptionLinks: [],
            listItems: [],
            imageUrl: item.photo_url || item.thumbnail_url || "",
          },
        ],
      };

      // Check if the news already exists in the database
      const existingCard = news.cards.find(
        (card) => card.heading === newsCard.heading
      );
      if (!existingCard) {
        news.cards.push(newsCard);
      }
    }

    await news.save();
    console.log(`Stored news for category: ${category}`);
  } catch (error) {
    console.error("Error storing news:", error);
    throw error;
  }
};

// Fetch and store news for all categories
// const fetchAndStoreNewsForAllCategories = async () => {
//   try {
//     for (const category of ALLOWED_CATEGORIES) {
//       const newsData = await fetchNews(category, 2, "1d", "en");

//       if (newsData.status === "OK" && newsData.data.length > 0) {
//         let filteredNews = newsData.data;

//         // Additional filtering for "People" category to include only HR-related news
//         if (category.toLowerCase() === "people") {
//           const hrKeywords = [
//             "hr",
//             "human resources",
//             "recruitment",
//             "employee",
//             "workforce",
//           ];
//           filteredNews = filteredNews.filter((news) => {
//             const title = news.title?.toLowerCase();
//             const snippet = news.snippet?.toLowerCase();
//             return hrKeywords.some(
//               (keyword) => title.includes(keyword) || snippet.includes(keyword)
//             );
//           });
//         }

//         // Extended handling for "Digital" category to include AI-related keywords
//         if (categoryLower === "digital") {
//           const digitalKeywords = [
//             "digital",
//             "ai",
//             "artificial intelligence",
//             "machine learning",
//             "deep learning",
//             "automation",
//             "generative ai",
//             "large language model",
//             "chatgpt",
//           ];
//           return digitalKeywords.some(
//             (keyword) => title.includes(keyword) || snippet.includes(keyword)
//           );
//         }

//         if (filteredNews.length > 0) {
//           await storeNewsInDatabase(filteredNews, category);
//         } else {
//           console.log(`No relevant news found for category: ${category}`);
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error fetching and storing news:", error);
//   }
// };

const fetchAndStoreNewsForAllCategories = async () => {
  try {
    for (const category of ALLOWED_CATEGORIES) {
      // 🔁 Step 1: Expand query if category is "Digital" or "People"
      let query = category;
      if (category.toLowerCase() === "digital") {
        query =
          "Digital OR AI OR 'Artificial Intelligence' OR 'Machine Learning' OR 'Generative AI' OR ChatGPT";
      } else if (category.toLowerCase() === "people") {
        query =
          "HR OR 'Human Resources' OR Recruitment OR Employee OR Workforce";
      }

      // 🔁 Step 2: Fetch news using the updated query
      const newsData = await fetchNews(query, 2, "1d", "en");

      if (newsData.status === "OK" && newsData.data.length > 0) {
        let filteredNews = newsData.data;

        const titleIncludes = (news, keywords) => {
          const title = news.title?.toLowerCase() || "";
          const snippet = news.snippet?.toLowerCase() || "";
          return keywords.some(
            (keyword) =>
              title.includes(keyword.toLowerCase()) ||
              snippet.includes(keyword.toLowerCase())
          );
        };

        // ✅ Step 3: Apply filtering if needed
        if (category.toLowerCase() === "people") {
          const hrKeywords = [
            "hr",
            "human resources",
            "recruitment",
            "employee",
            "workforce",
          ];
          filteredNews = filteredNews.filter((news) =>
            titleIncludes(news, hrKeywords)
          );
        }

        if (category.toLowerCase() === "digital") {
          const digitalKeywords = [
            "digital",
            "ai",
            "artificial intelligence",
            "machine learning",
            "deep learning",
            "automation",
            "generative ai",
            "large language model",
            "chatgpt",
          ];
          filteredNews = filteredNews.filter((news) =>
            titleIncludes(news, digitalKeywords)
          );
        }

        // ✅ Step 4: Store filtered news
        if (filteredNews.length > 0) {
          await storeNewsInDatabase(filteredNews, category);
        } else {
          console.log(`No relevant news found for category: ${category}`);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching and storing news:", error);
  }
};


module.exports = fetchAndStoreNewsForAllCategories;
