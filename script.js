const apiKey = 'api_key=d03d4a28cd118449a2aea4602b6d97fc';
const url = 'https://api.themoviedb.org/3/';
const imagePath = 'http://image.tmdb.org/t/p/original';
const moviesContainer = document.querySelector('.movies-container');
const youtubePath = 'https://www.googleapis.com/youtube/v3/';
const youtubeApiKey = 'AIzaSyAsr77shLiQNSh_dN2CJUdB8IaCtveYkw8';

let trailerPlayer;

const apiPath = {
  fetchCategoryApi: `${url}genre/movie/list?${apiKey}`,
  fetchMovieList: (id) => `${url}discover/movie?${apiKey}&with_genres=${id}`,
  fetchTrendingMovies: `${url}trending/movie/day?${apiKey}&language=en-US`,
  fetchYoutubeAPI: (query) => `${youtubePath}search?part=snippet&q=${query}&key=${youtubeApiKey}`,
};

function start() {
  fetchCategory();
  const trendingMovieData = apiPath.fetchTrendingMovies;
  fetchTrendingMovies(trendingMovieData, 'Trending Now');
}

function fetchTrendingMovies(trendingMovieData, data) {
  fetch(trendingMovieData)
    .then((response) => response.json())
    .then((response) => {
      const trendingMovies = response.results.slice(0, 4);
      trendingMovies.forEach(movie => {
        showTrendingMovie(movie);
      });
    })
    .catch((error) => {
      console.log(`Error fetching trending movies: ${error}`);
    });
}

function fetchCategory() {
  fetch(apiPath.fetchCategoryApi)
    .then((response) => response.json())
    .then((response) => {
      const categories = response.genres;
      if (Array.isArray(categories) && categories.length > 0) {
        categories.forEach(category => {
          fetchMoviesAndBuildSection(apiPath.fetchMovieList(category.id), category);
        });
      }
    })
    .catch((error) => {
      console.log(`Error fetching movie categories: ${error}`);
    });
}

function fetchMoviesAndBuildSection(fetchUrl, category) {
  fetch(fetchUrl)
    .then((response) => response.json())
    .then((response) => {
      const movies = response.results.slice(0, 4);
      if (Array.isArray(movies) && movies.length > 0) {
        buildMovieSection(movies, category.name);
      }
    })
    .catch((error) => {
      console.log(`Error fetching movies for category ${category.name}: ${error}`);
    });
}

function buildMovieSection(movies, categoryName) {
  const moviesList = movies.map(movie => {
    return `<img src="${imagePath}${movie.backdrop_path}" class="movie-cover-image" alt="${movie.title}" data-title='${movie.title}' onclick="playTrailer('${movie.title}')">`;
  }).join('');
  const sectionDiv = document.createElement('div');
  const movieSectionHTML = `
    <h2 class="movie-heading">${categoryName}</h2>
    <div class="movie-items">
      ${moviesList}
    </div>`;
  sectionDiv.innerHTML = movieSectionHTML;
  moviesContainer.appendChild(sectionDiv);

  const movieThumbnails = document.querySelectorAll('.movie-cover-image');
  movieThumbnails.forEach(movieThumbnail => {
    movieThumbnail.addEventListener('mousemove', () => playTrailer(movieThumbnail.dataset.title))
    // movieThumbnail.addEventListener('mouseleave', () => removeTrailer())
  })
}

function showTrendingMovie(movie) {
  const movieItem = document.querySelector('.movie-items');
  const movieCoverImage = document.createElement('img');
  movieCoverImage.classList.add('movie-cover-image');
  movieCoverImage.src = `${imagePath}${movie.backdrop_path}`;
  movieCoverImage.alt = movie.title;
  movieCoverImage.addEventListener('click', () => updateCover(movie))
  movieItem.appendChild(movieCoverImage);
}

function updateCover(movie) {
  const bannerSection = document.querySelector(`.banner-section`);
  bannerSection.innerHTML = `
    <img class="banner-image" src="${imagePath}${movie.backdrop_path}">  
    <div class="banner-content">
      <h1 class="banner-title">${movie.title}</h1>
      <p class="banner-info">
        <span class="release-year">${movie.release_date} |</span>
        <span class="rating">${Math.floor(movie.vote_average)} </span> |
        <span class="season-list">${movie.vote_count} Votes |</span>
        <span class="art-category">Drama</span>
      </p>
      <p class="banner-overview">${movie.overview}</p>
      <div class="banner-action-button">
        <button type="button" class="action-button1">Play</button>
        <button type="button" class="action-button2"> &#9432 More Info</button>
      </div>
    </div>  
  `
}

function playTrailer(movieName) {
  fetch(apiPath.fetchYoutubeAPI(movieName))
    .then((response) => response.json())
    .then((response) => {
      const trailerID = response.items[0].id.videoId;
      const youtubeURl = `https://www.youtube.com/watch?v=${trailerID}`
      trailerPlayer = document.createElement('iframe');
      trailerPlayer.src = youtubeURl;
      document.body.appendChild(trailerPlayer);
      console.log(youtubeURl);
    })
    .catch((error) => console.log(`Can't Play Trailer`))
}

window.addEventListener('load', start);
