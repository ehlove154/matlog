const $timetableForm = document.getElementById("timetableForm");
const $timetable = $timetableForm.querySelector(':scope > .timetable');
const $weeklySession = $timetable.querySelector(':scope > [data-mt-name="weeklySession"]');
const $sessionContainer = $weeklySession.querySelector(':scope > .session-container');
const $content = $sessionContainer.querySelector(':scope > .content'); // session

const $titleContainer = $timetableForm.querySelector(':scope > .title-container');

$timetableForm.addEventListener("click", (e) => {
    e.preventDefault();
})