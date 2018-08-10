countdown();

var database = firebase.database();
var index = 0;
var timer = 59;

// On click
$(document).on("click", "#add-train", function (event) {
    event.preventDefault();

    var trainName = $("#train-name-input").val().trim();
    var trainDest = $("#destination-input").val().trim();
    var trainTime = $("#time-input").val().trim();
    var trainFreq = $("#frequency-input").val().trim();

    database.ref().push({
        name: trainName,
        dest: trainDest,
        time: trainTime,
        freq: trainFreq,
        dateAdded: firebase.database.ServerValue.TIMESTAMP,
    });

    // Clear form values
    $("#train-name-input").val('');
    $("#destination-input").val('');
    $("#time-input").val('');
    $("#frequency-input").val('');
});

// Firebase
database.ref().on("child_added", function (snapshot) {
    var sv = snapshot.val();
    var key = snapshot.key;
    var trainName = sv.name;
    var trainDest = sv.dest;
    var trainFreq = sv.freq;
    var trainTime = sv.time;

    // Calculate minutes
    var timeFormatted = moment(trainTime, "hh:mm");
    var diffTime = moment().diff(moment(timeFormatted), "minutes");
    var remainder = diffTime % trainFreq;

    if (remainder < 0) {
        var minutesAway = Math.abs(diffTime);
        var nextTrain = timeFormatted;
    } else {
        var minutesAway = trainFreq - remainder;
        var nextTrain = moment().add(minutesAway, "minutes");
    };

    var nextTrainFormatted = moment(nextTrain).format("h:mm a");

    var newRow = $("<tr>");
    newRow.attr("id", `${index}`);
    var html =
        `<td>${trainName}</td>` +
        `<td>${trainDest}</td>` +
        `<td>${trainFreq}</td>` +
        `<td>${nextTrainFormatted}</td>` +
        `<td>${minutesAway}</td>` +
        `<td><button class='btn btn-danger btn-sm remove-button' key=${key} id='btn-${index}'>` +
        `<i class="fa fa-trash" aria-hidden="true"></i></button></td>`;
    newRow.html(html);
    $("#trains-go-here").append(newRow);
    index++;
});

// Update
function update() {
    console.log("Updating...");
    location.reload();
};
$(document).on("click", "#update-button", update);

// Timer
function countdown() {
    setInterval(function () {
        $("#timer").text(timer);
        if (timer <= 0) {
            update();
        };
        timer--;
    }, 1000);
};

// Delete button
$(document).on("click", ".remove-button", function (event) {
    event.preventDefault();
    var key = $(this).attr("key");
    console.log(`Remove row ${key}`);
    database.ref().child(key).remove();
    update();
});
