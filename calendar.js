const id = () => "_" + Math.random().toString(36).substr(2, 9);

const loadCalendar = () => {
  const calendarEl = document.getElementById("calendarOne");
  const calendarElTwo = document.getElementById("calendarTwo");

  const calendarTwo = new FullCalendar.Calendar(calendarElTwo, {
    initialView: "dayGridMonth",
    aspectRatio: 2,
  });

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    aspectRatio: 2,
    selectable: true,
    themeSystem: "bootstrap",
    select: ({ startStr, endStr }) => {
      let newEvent = {
        id: id(),
        start: startStr,
        end: endStr,
      };

      calendar.addEvent(newEvent);
      calendarTwo.addEvent(newEvent);
    },
    eventClick: ({ event: { id } }) => {
      const selectedEvent = calendar.getEventById(id);
      selectedEvent.remove();
    },
    selectOverlap: ({ startStr, endStr, id }) => {
      console.log(id);
      Swal.fire({
        title: "Fecha Ocupada",
        text: `${startStr} - ${endStr}`,
        icon: "error",
      });
    },
    eventDisplay: "background",
    eventBackgroundColor: "red",
  });
  calendar.render();
  calendarTwo.render();
};

document.addEventListener("DOMContentLoaded", loadCalendar);
