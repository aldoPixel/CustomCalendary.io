const id = () => "_" + Math.random().toString(36).substr(2, 9);

document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  let customEvents = [];
  let title = "";
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    aspectRatio: 2,
    selectable: true,
    themeSystem: "bootstrap",
    select: ({ startStr, endStr }) => {
      title = prompt("Inserta nombre");
      title && title.trim().length > 0
        ? calendar.addEvent({
            id: id(),
            title,
            start: startStr,
            end: endStr,
          })
        : alert("El evento debe llevar nombre");
    },
    eventClick: ({ event: { id } }) => {
      const selectedEvent = calendar.getEventById(id);
      selectedEvent.remove();
    },
  });
  calendar.render();
});
