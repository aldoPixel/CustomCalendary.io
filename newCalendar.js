const formatDate = (date) => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [month, day, year].join("/");
};

const clickLockedDays = ({
  target: {
    dataset: { val },
  },
}) => {
  // Se usa una librería llamada Sweet Alert 2 para mandar una alerta
  Swal.fire({
    icon: "error",
    title: "Error",
    // Se usan los template Strings de ES6 para insertar la fecha en la cadena del texto
    text: `Date ${formatDate(val)} Not Available`,
  });
};

const app = new Vue({
  el: `#app`,
  data: {
    title: "Fuck",
    dates: [
      "2021-05-01",
      "2021-05-02",
      "2021-05-03",
      "2021-05-04",
      "2021-05-05",
    ],
  },
  mounted() {
    let whenInstance = new When({
      container: document.getElementById("picker-input"),
      // keyboardEvents: true,
      // Establecemos que sea siempre visible
      inline: true,
      // Establecemos que se muestren dos meses por página
      double: true,
      // Establecemos que la fecha mínima de selección sea el día de hoy
      minDate: new Date(),
      // Pasamos nuestro arreglo obtenido del LocalStorage como fechas bloqueadas
      disabledDates: this.dates,
    });
  },
});
