// URL вашого API
const API_URL = 'http://localhost:5112/api/recipes'; 

let recipes = [];
let currentTab = 'all';
let currentRecipeId = null;

// Елементи
const recipeContainer = document.getElementById('recipe-container');
const createRecipeBtn = document.getElementById('create-recipe-btn');
const createRecipeModal = document.getElementById('create-recipe-modal');
const recipeDetailModal = document.getElementById('recipe-detail-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const recipeForm = document.getElementById('recipe-form');
const addIngredientBtn = document.getElementById('add-ingredient');
const addStepBtn = document.getElementById('add-step');
const ingredientList = document.getElementById('ingredient-list');
const stepList = document.getElementById('step-list');
const searchInput = document.querySelector('.search-bar input');
const navButtons = document.querySelectorAll('.nav-btn');
const detailFavoriteBtn = document.getElementById('detail-favorite-btn');

// Кнопка теми
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');

// СТАРТ
async function init() {
    setupTheme(); // Налаштування теми при запуску
    setupEventListeners();
    await fetchRecipes(); 
}

// === ЛОГІКА ТЕМИ ===
function setupTheme() {
    // Перевіряємо, чи є збережена тема
    const savedTheme = localStorage.getItem('theme');
    
    // Якщо збережено "dark" або немає збереженого, але системна тема темна
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun'; // Іконка сонця для перемикання на світлу
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-moon'; // Іконка місяця
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeIcon.className = 'fas fa-moon';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    }
}

// === API ТА ЛОГІКА ===

// 1. ЗАВАНТАЖЕННЯ ДАНИХ
async function fetchRecipes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Помилка мережі');
        recipes = await response.json();
        renderRecipes();
    } catch (error) {
        console.error('Помилка:', error);
        recipeContainer.innerHTML = '<p style="text-align:center; padding:20px; color:red;">Сервер недоступний. Запустіть проект у Visual Studio!</p>';
    }
}

// 2. ВІДПРАВКА НОВОГО РЕЦЕПТУ (POST)
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('recipe-title').value;
    const description = document.getElementById('recipe-description').value;
    const difficulty = document.getElementById('recipe-difficulty').value;
    const image = document.getElementById('recipe-image').value || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80';
    
    const ingredients = [];
    document.querySelectorAll('.ingredient-input').forEach(input => {
        if (input.value.trim()) ingredients.push(input.value.trim());
    });
    
    const steps = [];
    document.querySelectorAll('.step-input').forEach(input => {
        if (input.value.trim()) steps.push(input.value.trim());
    });
    
    const newRecipe = {
        title, description, difficulty, ingredients, steps, image,
        isFavorite: false
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecipe)
        });

        if (response.ok) {
            recipeForm.reset();
            resetDynamicFields();
            createRecipeModal.classList.remove('active');
            // ПРИБРАЛИ ALERT (повідомлення) ЗВІДСИ
            await fetchRecipes(); 
        }
    } catch (error) {
        alert('Помилка при збереженні');
    }
}

// 3. ЛАЙК РЕЦЕПТУ (PUT)
async function toggleFavorite(recipeId) {
    try {
        const response = await fetch(`${API_URL}/${recipeId}/favorite`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            const recipe = recipes.find(r => r.id === recipeId);
            if (recipe) {
                recipe.isFavorite = !recipe.isFavorite;
                renderRecipes();
                if (currentRecipeId === recipeId && recipeDetailModal.classList.contains('active')) {
                    updateDetailFavoriteButton(recipe.isFavorite);
                }
            }
        }
    } catch (error) {
        console.error('Помилка лайка:', error);
    }
}

// === ВІДМАЛЬОВКА ===
function renderRecipes() {
    recipeContainer.innerHTML = '';
    let filteredRecipes = recipes;
    
    if (currentTab === 'favorites') {
        filteredRecipes = recipes.filter(r => r.isFavorite);
    }
    
    const term = searchInput.value.toLowerCase();
    if (term) {
        filteredRecipes = filteredRecipes.filter(r => 
            r.title.toLowerCase().includes(term) || 
            r.description.toLowerCase().includes(term)
        );
    }
    
    filteredRecipes.forEach(recipe => {
        recipeContainer.appendChild(createRecipeCard(recipe));
    });
    
    if (filteredRecipes.length === 0) {
        recipeContainer.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;"><h3>Рецепти не знайдені</h3></div>`;
    }
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    const diffText = { easy: 'Легко', medium: 'Середня', hard: 'Складно' };
    
    card.innerHTML = `
        <div class="recipe-image" style="background-image: url('${recipe.image}')">
            <span class="difficulty ${recipe.difficulty}">${diffText[recipe.difficulty] || recipe.difficulty}</span>
        </div>
        <div class="recipe-content">
            <h3 class="recipe-title">${recipe.title}</h3>
            <div class="recipe-meta">
                <span>${recipe.ingredients.length} інгредієнтів</span>
                <span>${recipe.steps.length} кроків</span>
            </div>
            <p class="recipe-description">${recipe.description}</p>
            <div class="recipe-actions">
                <button class="favorite-btn ${recipe.isFavorite ? 'active' : ''}">
                    <i class="${recipe.isFavorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <a href="#" class="view-recipe">Переглянути</a>
            </div>
        </div>
    `;
    
    card.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(recipe.id));
    card.querySelector('.view-recipe').addEventListener('click', (e) => {
        e.preventDefault();
        showRecipeDetail(recipe.id);
    });
    return card;
}

function showRecipeDetail(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    currentRecipeId = id;
    
    document.getElementById('detail-title').textContent = recipe.title;
    document.getElementById('detail-image').style.backgroundImage = `url('${recipe.image}')`;
    document.getElementById('detail-difficulty').textContent = recipe.difficulty;
    document.getElementById('detail-description').textContent = recipe.description;
    
    const ingList = document.getElementById('detail-ingredients');
    ingList.innerHTML = '';
    recipe.ingredients.forEach(i => {
        const li = document.createElement('li');
        li.textContent = i;
        ingList.appendChild(li);
    });
    
    const stList = document.getElementById('detail-steps');
    stList.innerHTML = '';
    recipe.steps.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        stList.appendChild(li);
    });
    
    updateDetailFavoriteButton(recipe.isFavorite);
    recipeDetailModal.classList.add('active');
}

function updateDetailFavoriteButton(isFav) {
    const icon = detailFavoriteBtn.querySelector('i');
    if (isFav) {
        detailFavoriteBtn.classList.add('active');
        icon.className = 'fas fa-heart';
    } else {
        detailFavoriteBtn.classList.remove('active');
        icon.className = 'far fa-heart';
    }
}

function toggleFavoriteFromDetail() {
    if (currentRecipeId) toggleFavorite(currentRecipeId);
}

function resetDynamicFields() {
    ingredientList.innerHTML = `<div class="ingredient-item"><input type="text" class="form-control ingredient-input" placeholder="Інгредієнт" required><button type="button" class="remove-item">&times;</button></div>`;
    stepList.innerHTML = `<div class="step-item"><textarea class="form-control step-input" placeholder="Крок" required></textarea><button type="button" class="remove-item">&times;</button></div>`;
    setupDynamicRemoveButtons();
}

function addIngredientField() {
    const div = document.createElement('div');
    div.className = 'ingredient-item';
    div.innerHTML = `<input type="text" class="form-control ingredient-input" placeholder="Інгредієнт"><button type="button" class="remove-item">&times;</button>`;
    ingredientList.appendChild(div);
    setupDynamicRemoveButtons();
}

function addStepField() {
    const div = document.createElement('div');
    div.className = 'step-item';
    div.innerHTML = `<textarea class="form-control step-input" placeholder="Крок"></textarea><button type="button" class="remove-item">&times;</button>`;
    stepList.appendChild(div);
    setupDynamicRemoveButtons();
}

function setupDynamicRemoveButtons() {
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.onclick = (e) => {
            const item = e.target.closest('.ingredient-item') || e.target.closest('.step-item');
            if (item.parentElement.children.length > 1) item.remove();
        };
    });
}

function setupEventListeners() {
    createRecipeBtn.onclick = () => createRecipeModal.classList.add('active');
    closeModalButtons.forEach(b => b.onclick = () => {
        createRecipeModal.classList.remove('active');
        recipeDetailModal.classList.remove('active');
    });
    window.onclick = (e) => {
        if (e.target === createRecipeModal) createRecipeModal.classList.remove('active');
        if (e.target === recipeDetailModal) recipeDetailModal.classList.remove('active');
    };
    recipeForm.addEventListener('submit', handleFormSubmit);
    addIngredientBtn.onclick = addIngredientField;
    addStepBtn.onclick = addStepField;
    searchInput.oninput = () => renderRecipes();
    navButtons.forEach(btn => {
        if (!btn.classList.contains('theme-toggle')) {
            btn.onclick = () => {
                navButtons.forEach(b => {
                    if (!b.classList.contains('theme-toggle')) b.classList.remove('active');
                });
                btn.classList.add('active');
                currentTab = btn.getAttribute('data-tab');
                renderRecipes();
            }
        }
    });
    detailFavoriteBtn.onclick = toggleFavoriteFromDetail;
    
    // Додаємо слухача на кнопку теми
    themeToggleBtn.onclick = toggleTheme;
    
    setupDynamicRemoveButtons();
}

// Запуск
init();