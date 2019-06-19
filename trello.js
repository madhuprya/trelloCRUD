var token = "70f361bbb63ef8ef719f5adbf766703d555b775d69e9f368b4af1d0894581f59";
var key = "528ef6da60343fa8086bac0831fd43aa";
var trelloId = "uG0ypKxz";

var endpoints = `https://api.trello.com/1/boards/${trelloId}/lists?key=${key}&token=${token}`;
var cardId;

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
    cardId = data['id'];
    fetch(`https://api.trello.com/1/cards/${data['id']}/checklists?key=${key}&token=${token}`)
        .then(response => response.json())
        .then(data => data.map(list => list['checkItems']))
        .then(data => data.reduce((accumulator, item) => {
            item.map(i => accumulator.push(i));
            return accumulator;
        }, []))
        .then(data => generateCheckitems(data));
}



/******************* DOM MANIPULATION ******************/


getBoardList(2, 0);

function generateCheckitems(items) {
    console.log(items);
    var val = 1;
    items.map(item => {
        let i = `<li><input class="check-items" id=${item.id} type="checkbox"><a>${item.name}</a><i type="button">&times;</i></li><hr>`;

        $("#check-lists").append(i).css({
            "list-style": "none",
            "background-color": "#d9eaad",
            "font-size": "20px",
            "padding": "100px 300px",
            "margin": "100px 300px",
            "cursor": "pointer"
        }).height("300px").width("300px");


        fetch(`https://api.trello.com/1/cards/${cardId}/checkItem/${item.id}/`)
            .then(response => response.json())
            .then((Object) => {
                (Object["state"] === "complete") ?
                $(`#${item.id}`).prop("checked", true) &&
                    $(`#${item.id}`).next().css({
                        "text-decoration": "line-through",
                        "color": "gray"
                    }):
                    $(`#${item.id}`).prop("checked", false) &&
                    $(`#${item.id}`).next().css({
                        "text-decoration": "none"
                    })
            });
    })
    $("#check-lists>li").css({
        "display": "flex",
        "flex-flow": "row nowrap",
        "justify-content": "space-between",
        "color": "red"
    });



    $("input").on("click", function () {
                if ($(this).is(':checked')) {
                    fetch(`https://api.trello.com/1/cards/${cardId}/checkItem/${this.id}?state=complete&key=${key}&token=${token}`, {
                            method: 'PUT'
                        })
                        .then(data => data.json())
                        .then((Object) => {
                            Object["state"] = "complete"
                        })
                        .then(() => $(`#${this.id}`).next().css({
                                    "text-decoration": "line-through",
                                    "color": "gray"})
                                    )
                            }
                            else {
                                fetch(`https://api.trello.com/1/cards/${cardId}/checkItem/${this.id}?state=incomplete&key=${key}&token=${token}`, {
                                        method: 'PUT'
                                    })
                                    .then(data => data.json())
                                    .then((Object) => {
                                        Object["state"] = "incomplete"
                                    })
                                    .then(() => $(`#${this.id}`).next().css({
                                        "text-decoration": "none",
                                        "color": "red"})
                                        )
                            }
                        });


            }