var token = "70f361bbb63ef8ef719f5adbf766703d555b775d69e9f368b4af1d0894581f59";
var key = "528ef6da60343fa8086bac0831fd43aa";
var trelloId = "uG0ypKxz";

var endpoints = `https://api.trello.com/1/boards/${trelloId}/lists?key=${key}&token=${token}`;

function getBoardList(bInd, cInd) {
    fetch(endpoints)
        .then(response => response.json())
        .then(data => data.map(list => list))
        .then(data => getCardLists(data[bInd], cInd));
}

function getCardLists(data, c) {
    fetch(`https://api.trello.com/1/lists/${data['id']}/cards?key=${key}&token=${token}`)
        .then(response => response.json())
        .then(data => data.map(list => list))
        .then(data => getCheckLists(data[c]));
}

function getCheckLists(data) {
    fetch(`https://api.trello.com/1/cards/${data['id']}/checklists?key=${key}&token=${token}`)
        .then(response => response.json())
        .then(data => data.map(list => list['checkItems']))
        .then(data => data.reduce((accumulator, item) => {
            item.map(i => accumulator.push(i));
            return accumulator;
        }, []))
        .then(data => getItems(data));
}



/******************* DOM MANIPULATION ******************/
function getItems(data) {
    var items = data.map(data => data.name);
    generateCheckitems(items);
}

getBoardList(2, 0);

function generateCheckitems(items) {
    items.map(item => {
        const c='\xf00d';
        let i = `<li><input type="checkbox">${item}<i>${c}</i></li><hr>`;
        $("#check-lists").append(i).css({
            "list-style": "none",
            "background-color": "#d9eaad",
            "font-size": "20px",
            "padding": "100px 300px",
            "margin":"100px 300px"
        }).height("300px").width("500px");
    })
}