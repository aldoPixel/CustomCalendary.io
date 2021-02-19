const id = () => "_" + Math.random().toString(36).substr(2, 9);

const loadCalendar = () => {
  const calendarEl = document.getElementById("calendarOne");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    aspectRatio: 2,
    selectable: true,
    themeSystem: "bootstrap",
    select: ({ startStr, endStr }) => {
      calendar.addEvent({
        id: id(),
        start: startStr,
        end: endStr,
      });
    },
    eventClick: ({ event: { id } }) => {
      const selectedEvent = calendar.getEventById(id);
      selectedEvent.remove();
    },
    selectOverlap: (event) => {
      console.log(event);
    },
  });
  calendar.render();
};

document.addEventListener("DOMContentLoaded", loadCalendar);
