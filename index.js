const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const movies = [];
const MOVIES_PER_PAGE = 12;
let theCurrentPage = 1;
let filteredMovies = [];
let modeState = "cardMode";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const controlPanel = document.querySelector("#control-panel");

// axios
axios
  .get(INDEX_URL)
  .then((response) => {
    // for (const movie of response.data.results) {
    //   movies.push(movie)
    // }
    // ES6
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));

// addEventListener
dataPanel.addEventListener("click", onPanelClicked);
searchForm.addEventListener("submit", onSearchFormSubmitted);
paginator.addEventListener("click", onPaginatorClicked);
controlPanel.addEventListener("click", switchMode);

// function
function switchMode(event) {
  const data = filteredMovies.length ? filteredMovies : movies;
  renderPaginator(data.length);
  if (event.target.matches(".list-btn") && modeState === "cardMode") {
    modeState = "listMode";
    listMode(getMoviesByPage(theCurrentPage));
  } else if (event.target.matches(".card-btn") && modeState === "listMode") {
    modeState = "cardMode";
    renderMovieList(getMoviesByPage(theCurrentPage));
  }
}

function renderMovieList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    // title, image, id 隨著每個 item 改變
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${
            POSTER_URL + item.image
          }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
              item.id
            }">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${
              item.id
            }">+</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

function listMode(data) {
  let rawHTML = "";
  data.forEach((item) => {
    // title, image, id 隨著每個 item 改變
    rawHTML += `
    <ul class="list-group">
      <li class="list-group-item fs-3">
        ${item.title}
        <button class="btn btn-info btn-add-favorite float-end mt-1" data-id="${item.id}">+</button>
        <button
          class="btn btn-primary btn-show-movie float-end mt-1 me-2" data-id="${item.id}"
          data-bs-toggle="modal"
          data-bs-target="#movie-modal"
          >
          More
        </button>
      </li>
    </ul>`;
  });
  dataPanel.innerHTML = rawHTML;
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  modalTitle.innerText = "Loading...";
  modalDate.innerText = "Loading...";
  modalDescription.innerText = "Loading...";
  modalImage.innerHTML = "";

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date:" + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find(function (movie) {
    return movie.id === id;
  });

  if (
    list.some(function (movie) {
      return movie.id === id;
    })
  ) {
    return alert("此電影已經在收藏清單中");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(targetId(event)));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(targetId(event)));
  }
}

function targetId(event) {
  return event.target.dataset.id;
}

function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault();
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase();
  //條件篩選
  // filteredMovies = movies.filter((movie) =>
  //   movie.title.toLowerCase().includes(keyword)
  // );
  filteredMovies = movies.filter(function (movie) {
    return movie.title.toLowerCase().includes(keyword);
  });
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    searchInput.value = "";
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  //重製分頁器
  renderPaginator(filteredMovies.length);
  //重新輸出至畫面
  if (modeState === "cardMode") {
    renderMovieList(getMoviesByPage(1));
  } else {
    listMode(getMoviesByPage(1));
  }
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);

  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") {
    return;
  }
  const page = Number(event.target.dataset.page);
  theCurrentPage = page;
  if (modeState === "cardMode") {
    renderMovieList(getMoviesByPage(page));
  } else if (modeState === "listMode") {
    listMode(getMoviesByPage(page));
  }
}
