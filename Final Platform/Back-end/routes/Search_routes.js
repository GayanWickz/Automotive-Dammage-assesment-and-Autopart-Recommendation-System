import express from "express";
import ECommerceModel from "../models/Product_add_platform.js";

const Search = express.Router();

// Enhanced search route with suggestions
Search.get("/search", async (req, res) => {
  const { query, suggest } = req.query;

  try {
    // Validate query
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const trimmedQuery = query.trim(); // Trim whitespace from the input query
    console.log(`Searching for query: "${trimmedQuery}"`);

    // First try exact match on PartNumber (case-insensitive, trim whitespace)
    const partNumberMatch = await ECommerceModel.find({
      $expr: {
        $eq: [
          { $trim: { input: "$PartNumber" } }, // Trim whitespace from PartNumber field
          trimmedQuery,
        ],
      },
      PartNumber: { $exists: true, $ne: null }, // Ensure PartNumber field exists
    })
      .populate("SellerID")
      .catch((err) => {
        console.error("Error populating SellerID for part number match:", err);
        return []; // Return empty array if populate fails
      });

    console.log(`PartNumber matches found: ${partNumberMatch.length}`);
    if (partNumberMatch.length > 0) {
      return res.status(200).json(partNumberMatch);
    }

    // If no part number match, try exact matches on ProductName or Description
    const exactMatches = await ECommerceModel.find({
      $or: [
        { ProductName: { $regex: `^${trimmedQuery}$`, $options: "i" } },
        { Description: { $regex: `^${trimmedQuery}$`, $options: "i" } },
      ],
    })
      .populate("SellerID")
      .catch((err) => {
        console.error("Error populating SellerID for exact matches:", err);
        return [];
      });

    console.log(`Exact matches (ProductName/Description) found: ${exactMatches.length}`);
    if (exactMatches.length > 0 || !suggest) {
      return res.status(200).json(exactMatches);
    }

    // If no exact matches and suggestions requested
    const words = trimmedQuery.split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) {
      console.log("No words for suggestions after splitting");
      return res.status(200).json([]);
    }

    const regexPatterns = words.map((w) => new RegExp(w, "i"));

    const suggestions = await ECommerceModel.find({
      $or: [
        { ProductName: { $in: regexPatterns } },
        { Description: { $in: regexPatterns } },
        { PartNumber: { $in: regexPatterns } },
      ],
    })
      .limit(10)
      .populate("SellerID")
      .catch((err) => {
        console.error("Error populating SellerID for suggestions:", err);
        return [];
      });

    console.log(`Suggestions found: ${suggestions.length}`);
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Error fetching search results" });
  }
});



// Advanced vehicle search route
Search.get("/advanced-vehicle-search", async (req, res) => {
  const { make, model, year } = req.query;

  try {
    // Validate query parameters
    if (!make && !model && !year) {
      return res.status(400).json({ message: "At least one search parameter (make, model, or year) is required" });
    }

    // Build the query object
    const query = { ProductType: "Vehicle" }; // Only search for vehicles

    if (make) {
      query.VehicleBrand = { $regex: make, $options: "i" }; // Case-insensitive match
    }
    if (model) {
      query.VehicleModel = { $regex: model, $options: "i" }; // Case-insensitive match
    }
    if (year) {
      query.Year = parseInt(year); // Exact match for year
    }

    console.log("Advanced vehicle search query:", query);

    // Query the database
    const results = await ECommerceModel.find(query)
      .populate("SellerID")
      .catch((err) => {
        console.error("Error populating SellerID:", err);
        return [];
      });

    console.log(`Advanced vehicle search results found: ${results.length}`);

    if (results.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error during advanced vehicle search:", error);
    res.status(500).json({ message: "Error performing advanced vehicle search" });
  }
});


export default Search;