require("dotenv").config();
const News = require("../models/News/news");

const ALLOWED_CATEGORIES = [
  "business transformation",
  "technology services",
  "regulatory compliance & risk",
  "treasury implementation",
  "people",
  "digital",
];

// Fetch news from the Real-Time News Data API
const fetchNews = async (
  query,
  limit = 3,
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
    return title?.includes(category) || snippet?.includes(category);
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
        imageUrl:item.source_logo_url,
        category: category,
        references: [{ title: item.source_name, url: item.source_url }],
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
const fetchAndStoreNewsForAllCategories = async () => {
  try {
    for (const category of ALLOWED_CATEGORIES) {
      const newsData = await fetchNews(category, 3, "1d", "en");
      if (newsData.status === "OK" && newsData.data.length > 0) {
        const filteredNews = filterNewsByCategory(newsData.data, category);
        await storeNewsInDatabase(filteredNews, category);
      }
    }
  } catch (error) {
    console.error("Error fetching and storing news:", error);
  }
};

module.exports = fetchAndStoreNewsForAllCategories;
