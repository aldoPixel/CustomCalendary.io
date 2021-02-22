const id = () => "_" + Math.random().toString(36).substr(2, 9);
const currentDate = new Date();
const date = new Date();
date.setMonth(date.getMonth() + 1);
date.setDate(1);

const loadCalendar = () => {
  const calendarEl = document.getElementById("calendarOne");
  const calendarElTwo = document.getElementById("calendarTwo");

  const calendarTwo = new FullCalendar.Calendar(calendarElTwo, {
    initialView: "dayGridMonth",
    aspectRatio: 2,
    initialDate: date,
    fixedWeekCount: false,
    selectable: true,
    validRange: {
      start: date,
    },
  });

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    initialDate: currentDate,
    validRange: {
      start: currentDate,
    },
    aspectRatio: 2,
    selectable: true,
    themeSystem: "bootstrap",
    fixedWeekCount: false,
    selectMirror: true,
    unselectAuto: false,
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
  });
  calendar.render();
  calendarTwo.render();
};

document.addEventListener("DOMContentLoaded", loadCalendar);
