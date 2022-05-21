const root = document.getElementById('root');
const input = document.getElementById('search-input');
const library = document.getElementById('characters-wrap');
const search = document.getElementById('search-btn');
const loadMore = document.querySelector('.load-more');

const maxAmountOfPersons = 826;
const personsToShow = 5;
loadMore.hidden = true;
input.setAttribute('placeholder', 'Enter id of character');

let state;

createPage();

search.addEventListener('click', findPersonById);
loadMore.addEventListener('click', showHidden);

function refreshState() {
    let state = {
        visible:
            Array.from(document.querySelectorAll('.card')).length -
            Array.from(document.querySelectorAll('.hidden')).length,
        hidden: Array.from(document.querySelectorAll('.hidden')).length,
        all: Array.from(document.querySelectorAll('.card')).length
    };
    return state;
}

async function findPersonById() {
    try {
        let personsId;
        if (JSON.parse(localStorage.getItem('personsId')) === null) {
            personsId = [];
        } else {
            personsId = JSON.parse(localStorage.getItem('personsId'));
        }
        if (isNaN(+input.value)) {
            throw new Error('Invalid input');
        } else if (+input.value > maxAmountOfPersons || +input.value < 1) {
            throw new Error('Character not found');
        }
        if (personsId.includes(Number(input.value))) {
            throw new Error('Character is already in the list');
        }

        personsId.push(Number(input.value));

        localStorage.setItem('personsId', JSON.stringify(personsId));

        await createCardReversed(personsId, personsId.length - 1);

        let maxAmountOfVisibleCards = Number(localStorage.getItem('maxVisible'));
        if (personsId.length > maxAmountOfVisibleCards) {
            document
                .getElementById(`person-id-${personsId[personsId.length - personsToShow + 1]}`)
                .classList.add('hidden');
            loadMore.hidden = false;
        }

        state = refreshState();
        [...document.querySelectorAll('.card .remove')].forEach((button) =>
            button.addEventListener('click', (event) =>
                confirm('Are you sure about removing person?') ? deleteCard(event) : 0
            )
        );

        input.value = '';
    } catch (err) {
        alert(err.message);
        input.value = '';
    }
}
async function createCardReversed(idOfCharacters, index, hidden = '') {
    await fetch('https://rickandmortyapi.com/api/character/' + idOfCharacters[index])
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            let person = data;
            //prettier-ignore
            library.innerHTML =
            `<div id = 'person-id-${idOfCharacters[index]}' class = 'card ${hidden}'>
                <div class = 'person__photo'>
                    <img src = '${person.image}' class='img' alt = '${person.name}'>
                </div>
                <h2 class = 'person__name'>${person.name}</h2>
                <div class = 'person__description'>
                    <h3 class = 'person__status ${person.status}'>${person.status}</h3>
                    <button class = 'remove'>Remove</button>
                </div>
            </div>` + library.innerHTML;
        });
}

async function createCardDirectly(idOfCharacters, index, hidden = '') {
    await fetch('https://rickandmortyapi.com/api/character/' + idOfCharacters[index])
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            let person = data;
            //prettier-ignore
            library.innerHTML +=
            `<div id = 'person-id-${idOfCharacters[index]}' class = 'card ${hidden}'>
                <div class = 'person__photo'>
                    <img src = '${person.image}' class='img' alt = '${person.name}'>
                </div>
                <h2 class = 'person__name'>${person.name}</h2>
                <div class = 'person__description'>
                    <h3 class = 'person__status ${person.status}'>${person.status}</h3>
                    <button class = 'remove'>Remove</button>
                </div>
            </div>`;
        });
}

async function renderAllCards(cards) {
    if (cards.length < personsToShow + 1) {
        for (let i = 0; i < cards.length; i++) {
            await createCardReversed(cards, i);
        }
    } else {
        cards.reverse();

        for (let i = 0; i < personsToShow; i++) {
            await createCardDirectly(cards, i);
        }
        for (let i = 5; i < cards.length; i++) {
            await createCardDirectly(cards, i, 'hidden');
        }
        loadMore.hidden = false;
    }
}

async function showHidden() {
    let cards = Array.from(document.querySelectorAll('.hidden'));

    if (state.all - state.visible < personsToShow) {
        for (let i = 0; i < state.all - state.visible; i++) {
            await cards[i].classList.remove('hidden');
        }
    } else {
        for (let i = 0; i < personsToShow; i++) {
            await cards[i].classList.remove('hidden');
        }
    }
    state = refreshState();
    if (state.hidden === 0) {
        loadMore.hidden = true;
    }
    localStorage.setItem('maxVisible', personsToShow + +localStorage.getItem('maxVisible'));
    window.scrollTo(0, document.body.scrollHeight);
}

async function createPage() {
    localStorage.setItem('maxVisible', personsToShow);
    let caractersArray = JSON.parse(localStorage.getItem('personsId'));
    if (caractersArray === null) {
        return;
    } else {
        await renderAllCards(caractersArray);
        state = refreshState();
        [...document.querySelectorAll('.card .remove')].forEach((button) =>
            button.addEventListener('click', (event) =>
                confirm('Are you sure about removing person?') ? deleteCard(event) : 0
            )
        );
    }
}

function deleteCard(event) {
    const idOfDOMElement = event.target.closest('.card').id;
    event.target.closest('.card').remove();
    let [idOfPerson] = idOfDOMElement.match(/\d+/g);
    const personsId = JSON.parse(localStorage.getItem('personsId'));
    console.log(`${idOfPerson}  ${typeof idOfPerson}`);
    console.log(personsId);
    const index = personsId.indexOf(+idOfPerson);
    console.log(index);
    personsId.splice(index, 1);
    localStorage.setItem('personsId', JSON.stringify(personsId));
}
