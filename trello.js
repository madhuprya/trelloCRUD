var token = "70f361bbb63ef8ef719f5adbf766703d555b775d69e9f368b4af1d0894581f59";
var key = "528ef6da60343fa8086bac0831fd43aa";
var trelloId = "uG0ypKxz";

var endpoints = `https://api.trello.com/1/boards/${trelloId}/lists?key=${key}&token=${token}`;
var cardId;
// var checkListsItems = `<select id="select"></select>`;

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
        .then(data => {
            getCheckLists(data[c]), getOptions(data[c])
        });
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

function getOptions(data) {
    fetch(`https://api.trello.com/1/cards/${data['id']}/checklists?key=${key}&token=${token}`)
        .then(response => response.json())
        .then(data => data.map(data => {
            let option = `<option value=${data['id']}>${data["name"]}</option>`;
            $("#select").append(option);
        }));
}


/******************* DOM MANIPULATION******************/


getBoardList(2, 0);

function generateCheckitems(items) {
   // console.log(items);
    items.map(item => {
        getItems(item)
    });
    /******************* DOM MANIPULATION FETCH "GET" ******************/
    function getItems(item) {
        // items.map(item => {
        let list = `<li><input class="check-items" id=${item.id} type="checkbox"><a>${item.name}</a><button class="btn"  id=${item.id} type="button">&times;</button></li>`;

        $("#check-lists").append(list).css({
            "list-style": "none",
            "background-color": "#d9eaad",
            "font-size": "20px",
            "padding": "100px 300px",
            "margin": "100px 300px",
            "cursor": "pointer"
        }).height("auto").width("500px");


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

        $("#check-lists>li").css({
            "display": "flex",
            "flex-flow": "row nowrap",
            "justify-content": "space-between",
            "color": "red",
            "cursor": "pointer",
            "margin-top": "10px"
        });
        $("button").css({
            "background-color": "azure",
            "cursor": "pointer",
            "border-style": "none",
            "outline": "none",
            "color": "green",

        })
    }
    /*************************DOM MANIPULATION UPDATE "PUT" ********************************* */
    $(".check-items").on("click", function () {
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
                    "color": "gray"
                }))
        } else {
            fetch(`https://api.trello.com/1/cards/${cardId}/checkItem/${this.id}?state=incomplete&key=${key}&token=${token}`, {
                    method: 'PUT'
                })
                .then(data => data.json())
                .then((Object) => {
                    Object["state"] = "incomplete"
                })
                .then(() => $(`#${this.id}`).next().css({
                    "text-decoration": "none",
                    "color": "red"
                }))
        }
    });

    /******************* DOM MANIPULATION REMOVE "DELETE" ******************/
    $(".btn").on("click", function () {
        fetch(`https://api.trello.com/1/cards/${cardId}/checkItem/${this.id}?key=${key}&token=${token}`, {
                method: 'DELETE'
            })
            .then(() => $(this).parent().remove() && $(this).parent().next().remove())
    })

    /**************************DOM MANIPULATION CREATE "POST" ***************************** */

    let create = `<li><input class="chk" id="item" type=""><button class="chk" id="add">ADD ITEMS</button><li>`
    $("#check-lists").prepend(create)
    $("#select").css({
        "position": "absolute",
        "top": "200px",
        "left": "500px"
    })
    $("#add").css({
        "cursor": "pointer",
        "border-radius": "50px",
        "background-color": "azure",
        "color": "green",
        "border-style": "none",
        "outline": "none",
        "padding": "5px",
        "margin-left": "10px"
    })
    $("#item").css({
        "width": "300px",
        "outline": "none",
        "padding": "5px",
        "color": "red"
    })
    $("#select").css({
        "background-color": "azure",
        "border-style": "none",
        "height": "30px"

    })
    $("#add").on("click", function () {
        var s = document.getElementsByName('trello_id')[0];
        s.addEventListener("change", value);
        var value = s.options[s.selectedIndex].value;
        var input = $("#item").val();
        fetch(`https://api.trello.com/1/checklists/${value}/checkItems?name=${input}&pos=bottom&checked=false&key=${key}&token=${token}`, {
                method: 'POST'
            }).then(res => res.json())
            .then(data => getItems(data))

    })

}