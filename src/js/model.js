import { API_URL } from './config';
import { RESULTS_PER_PAGE } from './config';
import { getJSON } from './helper';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RESULTS_PER_PAGE,
  },
  bookmarks: [],
};

export const loadRecipe = async function (recipeId) {
  try {
    const data = await getJSON(`${API_URL}/${recipeId}`);

    const { recipe } = data.data;
    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    };

    if (state.bookmarks.some(bookmark => bookmark.id === recipeId)) {
      state.recipe.bookmarked = true;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const results = await getJSON(`${API_URL}?search=${query}`);

    state.search.results = results.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
      };
    });

    state.search.page = 1;
  } catch (error) {
    console.log(error);
    throw err;
  }
};

export const getSearchResultsPage = function (pageNumber = state.search.page) {
  state.search.page = pageNumber;

  const start = (pageNumber - 1) * RESULTS_PER_PAGE;
  const end = pageNumber * RESULTS_PER_PAGE;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newQuantity) {
  state.recipe.ingredients.forEach(ingredient => {
    ingredient.quantity =
      (ingredient.quantity * newQuantity) / state.recipe.servings;
  });

  state.recipe.servings = newQuantity;
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }
};

export const removeBookmark = function (recipeId) {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === recipeId);
  state.bookmarks.splice(index, 1);

  if (recipeId === state.recipe.id) {
    state.recipe.bookmarked = false;
  }
};
