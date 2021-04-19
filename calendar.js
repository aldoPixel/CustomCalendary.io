let whenInstance;
let dataSource;
let discount;
let flaw;
//Este evento se usa para mandar una alerta cuando se seleccione un rango de fecha no disponible, como parametros se usa la desestructuración de objetos de ES6 para obtener la fecha
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
  }).then((result) => {
    if (result.isConfirmed || result.isDismissed) {
      for (let i = 0; i < dataSource.length; i++) {
        if (dataSource[i].selectable) {
          if (dataSource[i].position === "last") {
            const temp =
              document.querySelectorAll(`[data-val="${dataSource[i].date}"]`) ||
              "";
            if (temp) {
              for (let i = 0; i < temp.length; i++) {
                temp[i].classList.add("middle-day-last");
              }
            }
          }
          if (dataSource[i].position === "first") {
            const temp =
              document.querySelectorAll(`[data-val="${dataSource[i].date}"]`) ||
              "";
            if (temp) {
              for (let i = 0; i < temp.length; i++) {
                temp[i].classList.add("middle-day");
              }
            }
          }
        } else {
          const temp =
            document.querySelectorAll(`[data-val="${dataSource[i].date}"]`) ||
            "";
          if (temp) {
            for (let i = 0; i < temp.length; i++) {
              temp[i].classList.add("disabled-custom");
            }
          }
        }
      }
    }
  });
};

// Este método se usa para cuando estamos seleccionando un rango de fechas y nuestra fecha final no puede ser seleccionada
const noSelectDates = () =>
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Dates Not Available",
  }).then((result) => {
    if (result.isConfirmed || result.isDismissed) {
      // window.location.reload();
      whenInstance.trigger("change:startDate", new Date());
      whenInstance.trigger("change:endDate", new Date());
      whenInstance.trigger("reset:start:end");
      for (let i = 0; i < dataSource.length; i++) {
        if (dataSource[i].selectable) {
          if (dataSource[i].position === "last") {
            const temp =
              document.querySelectorAll(`[data-val="${dataSource[i].date}"]`) ||
              "";
            if (temp) {
              for (let i = 0; i < temp.length; i++) {
                temp[i].classList.add("middle-day-last");
              }
            }
          }
          if (dataSource[i].position === "first") {
            const temp =
              document.querySelectorAll(`[data-val="${dataSource[i].date}"]`) ||
              "";
            if (temp) {
              for (let i = 0; i < temp.length; i++) {
                temp[i].classList.add("middle-day");
              }
            }
          }
        } else {
          const temp =
            document.querySelectorAll(`[data-val="${dataSource[i].date}"]`) ||
            "";
          if (temp) {
            for (let i = 0; i < temp.length; i++) {
              temp[i].classList.add("disabled-custom");
            }
          }
        }
      }
    }
  });

// Esta función le da formato americano a la fecha "Mes/Día/Año" a la fecha
const formatDate = (date) => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [month, day, year].join("/");
};

// Esta función de usa para limpiar el calendario de marcadores una vez que se cancele la selección o salte una alerta, se hace uso de Jquery y JS DOM
const resetDismissValue = () => {
  $(".activeRange").removeClass("activeRange");
  $(".active").removeClass("active");
  $(".first").removeClass("first");
  $(".last").removeClass("last");
  $(".autocomplete").removeClass("autocomplete");
  dismissableDaily = true;
  relativeSize = 0;
  selectedTemp = [];
  document.getElementById("check_out").value = "";
  document.getElementById("code-to").innerText = "";
  document.getElementById("n_nights").value = 0;
  document.getElementById("check_in").value = "";
  document.getElementById("code-from").innerText = "";
};

// Una vez que se carga todo el contenido de la página se ejecuta la función posteriormente establecida
document.addEventListener("DOMContentLoaded", () => {
  // Mandamos una señal de que nuestra página está renderizada
  console.log("DOM fully loaded and parsed");
  // Este arreglo extrae las fechas del LocalStorage, en caso de que no exista en LocalStorage se inicializa como arreglo vacío, este arreglo tendrá todas las fechas ocupadas
  dataSource = JSON.parse(localStorage.getItem("blockedDays")) || [];
  // Se declara un arreglo vacío
  let blockedDays = [];
  // Esta variable establece el minimo de noches, en este caso 1
  let minNights = 1;
  // Esta variable establece el máximo de noches, en este caso 15
  let maxNights = 20;
  // La varibale que va a disparar nuestras alertas se inicializa como false
  let dismissableDaily = false;
  // Esta variable va a identifar si se usa en modo semanal el selector de noches en el input o en el calendario
  let setWeeklyComplete = true;
  // Esta variable establece el modo de selección del calendario ya sea semanal ("weekly"), diario ("daily") o hibrido ("hybrid")
  let mode = "hybrid";
  // Esta variable establece el número de semanas
  let nWeeks = 4;
  // Inicializamos un arreglo temporal donde se guardarán las fechas seleccionadas
  let selectedTemp = [];

  // Por cada fecha en el LocalStorage filtramos las que no están seleccionadas y las agregamos a nuestro arreglo de fechas ocupadas
  for (let i = 0; i < dataSource.length; i++) {
    if (!dataSource[i].selectable) {
      blockedDays.push(dataSource[i].date);
    }
  }

  localStorage.removeItem("last");
  localStorage.removeItem("first");

  // Se crea nuestro calendario
  whenInstance = new When({
    // Seleccionamos el div que contendrá nuestro calendario
    container: document.getElementById("picker-input"),
    // keyboardEvents: true,
    // Establecemos que sea siempre visible
    inline: true,
    // Establecemos que se muestren dos meses por página
    double: true,
    // Establecemos que la fecha mínima de selección sea el día de hoy
    minDate: new Date(),
    // Pasamos nuestro arreglo obtenido del LocalStorage como fechas bloqueadas
    disabledDates: blockedDays,
  });

  whenInstance.trigger("change:startDate", new Date());
  whenInstance.trigger("change:endDate", new Date());
  whenInstance.trigger("reset:start:end");

  // $(".days-container")
  //   .last()
  //   .click(() => {
  //     discount = flaw ? 1 : 2;
  //     console.log(discount);
  //     console.log(flaw);
  //     flaw = false;
  //   });
  // $(".days-container")
  //   .first()
  //   .click(() => {
  //     discount = 1;
  //     flaw = true;
  //     console.log(flaw);
  //     console.log(discount);
  //   });

  whenInstance.on("secondDateSelect:before", (dateString) => {
    $(".autocomplete").removeClass("autocomplete");
    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].selectable) {
        $(`.day[data-val='${dataSource[i].date}']`).addClass("middle-day");
      }
    }
    localStorage.removeItem("last");
    localStorage.removeItem("first");
  });

  // Despues de seleccionar un rango de fechas se ejecuta una función que pasa como parametro la ultima fecha del rango
  whenInstance.on("secondDateSelect:after", (dateString) => {
    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].selectable && dataSource[i].position === "last") {
        $(`.day[data-val="${dataSource[i].date}"]`).addClass("middle-day-last");
      }
    }
    $(".autocomplete").removeClass("autocomplete");
    // Inicializamos nuestra selección temporal como vacía ya que de no hacerlo no limpiara nuestra selección y agregará días que no deseamos sean agregados como ocupados
    selectedTemp = [];
    // Inicializamos una constante si hay mas de una fecha seleccionada seleccionara todos los días con clase "activeRange", si solo se selecciona un día se buscarán todos los días con clase "active"
    const selected =
      $(".activeRange").length > 0
        ? document.querySelectorAll(".activeRange")
        : document.querySelectorAll(".active");
    // Se inicializa un arreglo vacío para meter las fechas seleccionadas
    let dates = [];
    // Por cada fecha seleccionada
    for (let i = 0; i < selected.length; i++) {
      // Se usa desestructuración de objetos de ES6 para estraer su fecha
      const {
        dataset: { val },
      } = selected[i];
      // Si la fecha no es undefined se agrega al arreglo de fechas
      val != undefined && dates.push(val);
    }

    // Se filtran las fechas para evitar duplicados
    let uniqueDates = new Set(dates);
    // Se obtienen los números de noches en caso de que solo se tenga una noche por defecto pondrá el número 1
    let relativeSize = uniqueDates.size - 1 > 0 ? uniqueDates.size - 1 : 0;
    // Se inicializa una variable para los días de autocompletado en modo semanal
    let autoDays = 0;

    // Si el modo es semanal
    if (mode === "weekly") {
      if (relativeSize % 7 > 0) {
        // Buscamos la ultima fecha que seleccionamos y ejecutamos una función
        $(".activeRange.last").each((index, element) => {
          // Los días que faltan para completar la semana se obtienen
          autoDays = 7 - (relativeSize % 7);
          // Se obtiene la fecha de cada uno de los días restantes para completar la semana
          const lDate = new Date($(element).attr("data-val"));
          // Creamos una condicional para verificar si febrero tiene 28 o 29 días (Esto es necesario ya que de no hacer esta verificación un bug se hace presente)
          const isLeap = new Date(lDate.getFullYear(), 1, 29).getMonth() == 1;
          // Si Febrero tiene 28 días además la ultima fecha fue 29 o 30 de Marzo se aumenta un día a nuestro autocompletado (es la solución del bug)
          if (
            !isLeap &&
            lDate.getMonth() === 2 &&
            (lDate.getDate() === 29 || lDate.getDate() === 30)
          ) {
            autoDays += 1;
          }
          // Por cada día en el rango de días que necesitamos para completar la semana
          for (let i = 0; i < autoDays; i++) {
            if (
              $(
                `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
              ).hasClass("disabled-custom") ||
              $(
                `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
              ).hasClass("middle-day")
            ) {
              break;
            }

            // Se aumenta en un día la fecha del ultimo día seleccionado
            lDate.setDate(lDate.getDate() + 1);
            dates.push(lDate.toISOString().slice(0, 10));
            $(`.day[data-val="${lDate.toISOString().slice(0, 10)}"]`).addClass(
              "autocomplete"
            );
          }
        });
      }
      // Se saca el número de semanas
      if (Math.round((relativeSize + autoDays) / 7) > nWeeks) {
        Swal.fire({
          icon: "error",
          title: "error",
          text: `You can't select more than ${nWeeks} weeks`,
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            dismissableDaily = true;
            resetDismissValue();
            whenInstance.trigger("reset:start:end");
          }
        });
      }
    }

    // Se filtran las fechas para evitar duplicados
    uniqueDates = new Set(dates);
    // Se obtienen los números de noches en caso de que solo se tenga una noche por defecto pondrá el número 1
    relativeSize = uniqueDates.size - 1 > 0 ? uniqueDates.size - 1 : 0;

    // Si el modo de selección es semanal
    if (mode === "hybrid") {
      // Si hay mas de 21 noches seleccionadas
      if (relativeSize > maxNights) {
        // Si faltan días para completar la semana
        if (relativeSize % 7 > 0) {
          // Buscamos la ultima fecha que seleccionamos y ejecutamos una función
          $(".activeRange.last").each((index, element) => {
            // Los días que faltan para completar la semana se obtienen
            autoDays = 7 - (relativeSize % 7);
            // Se obtiene la fecha de cada uno de los días restantes para completar la semana
            const lDate = new Date($(element).attr("data-val"));
            // Creamos una condicional para verificar si febrero tiene 28 o 29 días (Esto es necesario ya que de no hacer esta verificación un bug se hace presente)
            const isLeap = new Date(lDate.getFullYear(), 1, 29).getMonth() == 1;
            // Si Febrero tiene 28 días además la ultima fecha fue 29 o 30 de Marzo se aumenta un día a nuestro autocompletado (es la solución del bug)
            if (
              !isLeap &&
              lDate.getMonth() === 2 &&
              (lDate.getDate() === 29 || lDate.getDate() === 30)
            ) {
              autoDays += 1;
            }
            // Por cada día en el rango de días que necesitamos para completar la semana
            for (let i = 0; i < autoDays; i++) {
              if (
                $(
                  `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
                ).hasClass("disabled-custom") ||
                $(
                  `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
                ).hasClass("middle-day")
              ) {
                break;
              }

              // Se aumenta en un día la fecha del ultimo día seleccionado
              lDate.setDate(lDate.getDate() + 1);
              dates.push(lDate.toISOString().slice(0, 10));
              // Se busca el elemento con esa fecha y se le agrega una clase "autocomplete"
              $(
                `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
              ).addClass("autocomplete");
            }
          });
        }
        // Si el numero de semanas es mayor al límite
        if (Math.round((relativeSize + autoDays) / 7) > nWeeks) {
          // Se lanza una alerta
          Swal.fire({
            icon: "error",
            title: "error",
            text: `You can't select more than ${nWeeks} weeks`,
          }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
              // Si la alerta es cerrada
              dismissableDaily = true;
              // Se limpia el calendario
              resetDismissValue();
              whenInstance.trigger("reset:start:end");
            }
          });
        }
      }

      // Se filtran las fechas para evitar duplicados
      uniqueDates = new Set(dates);
      // Se obtienen los números de noches en caso de que solo se tenga una noche por defecto pondrá el número 1
      relativeSize = uniqueDates.size - 1 > 0 ? uniqueDates.size - 1 : 0;

      // Si el total de noches es menor al número de noches lanza una alerta
      // if (relativeSize < minNights) {
      //   // Si la fecha no es null lanza la alerta
      //   dateString !== null &&
      //     Swal.fire({
      //       icon: "error",
      //       title: "Error",
      //       text: `You must select at least ${minNights} nights`,
      //     }).then((result) => {
      //       if (result.isConfirmed || result.isDismissed) {
      //         // Si la alerta es cerrada
      //         dismissableDaily = true;
      //         // Limpia el calendario
      //         resetDismissValue();
      //         whenInstance.trigger("reset:start:end");
      //       }
      //     });
      // }
    }

    // Se agregan a nuestro arreglo temporal todas las fechas en el filtrado
    let setToArray = Array.from(uniqueDates);

    // Por cada día seleccionado
    for (let i = 0; i < setToArray.length; i++) {
      // Si el día es el pimero o ultimo seleccionado
      if (i === 0 || i === setToArray.length - 1) {
        // Si la fecha anterior a ese día no es válida
        if (
          $(`.day[data-val="${setToArray[i]}"]`)
            .prev()
            .attr("data-disabled") === "true"
        ) {
          // Se agrega al arreglo temporal como no fecha seleccionable
          selectedTemp.push({
            date: setToArray[i],
            selectable: false,
          });
        } else if (i === 0) {
          // Lo agrega al arreglo temporal como fecha seleccionable
          selectedTemp.push({
            date: setToArray[i],
            selectable: true,
            position: "first",
          });
        } else if (i === setToArray.length - 1) {
          selectedTemp.push({
            date: setToArray[i],
            selectable: true,
            position: "last",
          });
        }
      } else {
        // Si no es primero ni ultimo de nuestra selección se agrega al arreglo coo fecha no seleccionable
        selectedTemp.push({
          date: setToArray[i],
          selectable: false,
        });
      }
    }
    //selectedTemp.push(...uniqueDates);

    // Si el modo es diario
    if (mode === "daily") {
      // Si el tamaño de noches seleccionadas es mayor al número máximo de días
      if (relativeSize > maxNights) {
        dateString !== null &&
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `You can't select more than ${maxNights} nights`,
          }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
              dismissableDaily = true;
              resetDismissValue();
              whenInstance.trigger("reset:start:end");
            }
          });
      }

      // Si en modo diario el número de noches seleccionadas es menor al mínimo de noches
      // if (relativeSize < minNights) {
      //   // Si la fecha no es null se lanza una alerta
      //   dateString !== null &&
      //     Swal.fire({
      //       icon: "error",
      //       title: "Error",
      //       text: `You must select at least ${minNights} nights`,
      //     }).then((result) => {
      //       if (result.isConfirmed || result.isDismissed) {
      //         // Si la alerta es cerrada
      //         dismissableDaily = true;
      //         // Se limpia el calendario
      //         resetDismissValue();
      //         whenInstance.trigger("reset:start:end");
      //       }
      //     });
      // }
    }

    // Si se elige la misma noche
    // if (relativeSize < 1) {
    //   // Si la fecha no es null
    //   dateString !== null &&
    //     Swal.fire({
    //       icon: "error",
    //       title: "Error",
    //       text: "You must select at least one night",
    //     }).then((result) => {
    //       if (result.isConfirmed || result.isDismissed) {
    //         // Si la alerta es cerrada
    //         dismissableDaily = true;
    //         // Se limpia el calendario
    //         resetDismissValue();
    //         whenInstance.trigger("reset:start:end");
    //       }
    //     });
    // }

    // Se busca el input con el id "check_out" y cambiamos su valor al ultimo elemento con clase autocomplete, además de reemplazar los "-" por "/", todo realiado con jQuery, en caso de no encontrar autocompletado se coloca la ultima fecha seleccionada
    const lDateTemp = new Date(dates[dates.length - 1]);
    document.getElementById("check_out").value = `${formatDate(
      lDateTemp.setDate(lDateTemp.getDate() + 1)
    )}`;
    // Se busca el elemento con id "code-to" y cambiamos su innerText
    document.getElementById("code-to").innerText = `${formatDate(dateString)}`;
    // Si se seleccionaron los días usando el calendario se coloca en el selector de noches por defecto el número de noches
    if (setWeeklyComplete) {
      document.getElementById("n_nights").value = `${relativeSize}`;
    }

    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].selectable) {
        $(`.day[data-val='${dataSource[i].date}']`).addClass("middle-day");
      }
    }

    localStorage.removeItem("last");
    localStorage.removeItem("first");
  });

  // Después de seleccionar nuestra primera fecha
  whenInstance.on("firstDateSelect:after", (dateString) => {
    // Buscamos el input y el elemento con sus respectivos id y cambiamos su value e innerText a la primera fecha seleccionada
    document.getElementById("check_in").value = `${formatDate(dateString)}`;
    document.getElementById("code-from").innerText = `${formatDate(
      dateString
    )}`;
    // Si hacemos selección por calendario se establece en true
    setWeeklyComplete = true;
    const targetDate = new Date(dateString);
    const nextDate = new Date(dateString);
    nextDate.setDate(nextDate.getDate() + 1);

    if (
      $(`.day[data-val="${targetDate.toISOString().slice(0, 10)}"]`).hasClass(
        "middle-day"
      ) &&
      ($(`.day[data-val="${nextDate.toISOString().slice(0, 10)}"]`).hasClass(
        "disabled-custom"
      ) ||
        $(`.day[data-val="${nextDate.toISOString().slice(0, 10)}"]`).hasClass(
          "middle-day-last"
        ))
    ) {
      Swal.fire({
        title: "Date",
        icon: "info",
        text: formatDate(dateString),
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          whenInstance.trigger("change:startDate", new Date());
          whenInstance.trigger("change:endDate", new Date());
          whenInstance.trigger("reset:start:end");
        }
      });
    }

    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].selectable && dataSource[i].position === "last") {
        $(`.day[data-val="${dataSource[i].date}"]`).addClass("middle-day-last");
      } else if (
        dataSource[i].selectable &&
        dataSource[i].position === "first"
      ) {
        $(`.day[data-val="${dataSource[i].date}"]`).addClass("middle-day");
      }
    }
  });

  // Antes de seleccionar nuestra primera fecha
  whenInstance.on("firstDateSelect:before", (dateString) => {
    // Limpiamos los autocomplete del calendario
    $(".autocomplete").removeClass("autocomplete");
    // La alerta de error se establece en falso
    dismissableDaily = false;

    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].selectable) {
        $(`.day[data-val='${dataSource[i].date}']`).addClass("middle-day");
      }
    }

    let lasts = dataSource.filter(
      (val) => val.position === "first" && val.selectable === true
    );
    let firsts = dataSource.filter(
      (val) => val.position === "last" && val.selectable === true
    );
    let lastsDates = lasts.map((val) => val.date);
    lastsDates = lastsDates.sort((a, b) => {
      let tempA = new Date(a);
      let tempB = new Date(b);
      return tempA - tempB;
    });
    let firstsDates = firsts.map((val) => val.date);
    firstsDates = firstsDates.sort((a, b) => {
      let tempA = new Date(a);
      let tempB = new Date(b);
      return tempB - tempA;
    });
    for (let i = 0; i < firstsDates.length; i++) {
      let currDate = new Date(dateString);
      let tempDate = new Date(firstsDates[i]);

      if (currDate > tempDate) {
        localStorage.setItem("first", firstsDates[i]);
        break;
      }
    }
    for (let i = 0; i < lastsDates.length; i++) {
      let currDate = new Date(dateString);
      let tempDate = new Date(lastsDates[i]);
      tempDate.setDate(tempDate.getDate() + 1);

      if (currDate < tempDate) {
        localStorage.setItem("last", lastsDates[i]);
        break;
      }
    }
  });

  // Cuando se presiona el botón con el id "create_event"
  document.getElementById("create_event").addEventListener("click", () => {
    // Se obtiene un arreglo de fechas en el localStorage
    const { date: firstTemp } = selectedTemp[0];
    const { date: lastTemp } = selectedTemp[selectedTemp.length - 1];
    const firstSelection = new Date(firstTemp);
    const lastSelection = new Date(lastTemp);

    if (selectedTemp.length < 2) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: "You must select at least one night",
      });
      whenInstance.trigger("reset:start:end");
      return;
    }

    if (selectedTemp.length < minNights) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: `You must select at least ${minNights} nights`,
      });
      whenInstance.trigger("reset:start:end");
      return;
    }

    const tempArr = dataSource.map((val) => val.date);
    // Por cada fecha seleccionada
    const { date: selectionFirstDate } = selectedTemp[0];
    let selectionYear = parseInt(selectionFirstDate.split("-")[0]);
    let selectionMonth = parseInt(selectionFirstDate.split("-")[1]) - discount;
    if (selectionMonth === -1) {
      selectionMonth = 11;
      selectionYear -= 1;
    }
    if (selectionMonth === -2) {
      selectionMonth = 10;
    }
    // localStorage.setItem("selection", selection);
    for (let i = 0; i < selectedTemp.length; i++) {
      //Si ya se encuentra en el arreglo de fechas
      if (tempArr.includes(selectedTemp[i].date)) {
        // Se deshabilita la selección en la fecha
        selectedTemp[i].selectable = false;
        // Se filtra el arreglo para que la fecha seleccionada no se duplique
        dataSource = dataSource.filter(
          (val) => val.date !== selectedTemp[i].date
        );
      }
    }

    // Agregamos nuestros días del arreglo temporal al arreglo principal
    dataSource.push(...selectedTemp);
    // Ese arreglo se almacena en LocalStorage escribiendo o sobre-escribiendo el que teníamos

    localStorage.setItem("blockedDays", JSON.stringify(dataSource));

    localStorage.removeItem("last");
    localStorage.removeItem("first");

    whenInstance.disabledDates = dataSource;

    blockedDays = [];
    for (let i = 0; i < dataSource.length; i++) {
      if (!dataSource[i].selectable) {
        blockedDays.push(dataSource[i].date);
      }
    }

    document.getElementById("picker-input").innerHTML = "";

    whenInstance = new When({
      // Seleccionamos el div que contendrá nuestro calendario
      container: document.getElementById("picker-input"),
      // keyboardEvents: true,
      // Establecemos que sea siempre visible
      inline: true,
      // Establecemos que se muestren dos meses por página
      double: true,
      // Establecemos que la fecha mínima de selección sea el día de hoy
      minDate: new Date(),
      // Pasamos nuestro arreglo obtenido del LocalStorage como fechas bloqueadas
      disabledDates: blockedDays,
    });

    whenInstance.trigger(
      "change:startDate",
      firstSelection.setDate(firstSelection.getDate() + 1)
    );
    whenInstance.trigger(
      "change:endDate",
      lastSelection.setDate(lastSelection.getDate() + 1)
    );
    whenInstance.trigger("reset:start:end");

    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].selectable) {
        if (dataSource[i].position === "last") {
          const temp =
            document.querySelectorAll(`[data-val="${dataSource[i].date}"]`) ||
            "";
          if (temp) {
            for (let i = 0; i < temp.length; i++) {
              temp[i].classList.add("middle-day-last");
            }
          }
        }
        if (dataSource[i].position === "first") {
          const temp =
            document.querySelectorAll(`[data-val="${dataSource[i].date}"]`) ||
            "";
          if (temp) {
            for (let i = 0; i < temp.length; i++) {
              temp[i].classList.add("middle-day");
            }
          }
        }
      } else {
        const temp =
          document.querySelectorAll(`[data-val="${dataSource[i].date}"]`) || "";
        if (temp) {
          for (let i = 0; i < temp.length; i++) {
            temp[i].classList.add("disabled-custom");
            temp[i].addEventListener("click", clickLockedDays);
          }
        }
      }
    }

    whenInstance.trigger("change:yearPanel");
    $(`span[data-year-num=${selectionYear}]`).click();
    whenInstance.trigger("change:monthPanel");
    $(`span[data-month-num=${selectionMonth}]`).click();
    // $(".days-container")
    //   .last()
    //   .click(() => {
    //     discount = flaw ? 1 : 2;
    //     console.log(discount);
    //     console.log(false);
    //     flaw = false;
    //   });
    // $(".days-container")
    //   .first()
    //   .click(() => {
    //     discount = 1;
    //     flaw = true;
    //     console.log(flaw);
    //     console.log(discount);
    //   });

    whenInstance.on("secondDateSelect:before", (dateString) => {
      $(".autocomplete").removeClass("autocomplete");
      for (let i = 0; i < dataSource.length; i++) {
        if (dataSource[i].selectable) {
          $(`.day[data-val='${dataSource[i].date}']`).addClass("middle-day");
        }
      }
      localStorage.removeItem("last");
      localStorage.removeItem("first");
    });

    whenInstance.on("secondDateSelect:after", (dateString) => {
      for (let i = 0; i < dataSource.length; i++) {
        if (dataSource[i].selectable && dataSource[i].position === "last") {
          $(`.day[data-val="${dataSource[i].date}"]`).addClass(
            "middle-day-last"
          );
        }
      }
      $(".autocomplete").removeClass("autocomplete");
      // Inicializamos nuestra selección temporal como vacía ya que de no hacerlo no limpiara nuestra selección y agregará días que no deseamos sean agregados como ocupados
      selectedTemp = [];
      // Inicializamos una constante si hay mas de una fecha seleccionada seleccionara todos los días con clase "activeRange", si solo se selecciona un día se buscarán todos los días con clase "active"
      const selected =
        $(".activeRange").length > 0
          ? document.querySelectorAll(".activeRange")
          : document.querySelectorAll(".active");
      // Se inicializa un arreglo vacío para meter las fechas seleccionadas
      let dates = [];
      // Por cada fecha seleccionada
      for (let i = 0; i < selected.length; i++) {
        // Se usa desestructuración de objetos de ES6 para estraer su fecha
        const {
          dataset: { val },
        } = selected[i];
        // Si la fecha no es undefined se agrega al arreglo de fechas
        val != undefined && dates.push(val);
      }

      // Se filtran las fechas para evitar duplicados
      let uniqueDates = new Set(dates);
      // Se obtienen los números de noches en caso de que solo se tenga una noche por defecto pondrá el número 1
      let relativeSize = uniqueDates.size - 1 > 0 ? uniqueDates.size - 1 : 0;
      // Se inicializa una variable para los días de autocompletado en modo semanal
      let autoDays = 0;

      // Si el modo es semanal
      if (mode === "weekly") {
        if (relativeSize % 7 > 0) {
          // Buscamos la ultima fecha que seleccionamos y ejecutamos una función
          $(".activeRange.last").each((index, element) => {
            // Los días que faltan para completar la semana se obtienen
            autoDays = 7 - (relativeSize % 7);
            // Se obtiene la fecha de cada uno de los días restantes para completar la semana
            const lDate = new Date($(element).attr("data-val"));
            // Creamos una condicional para verificar si febrero tiene 28 o 29 días (Esto es necesario ya que de no hacer esta verificación un bug se hace presente)
            const isLeap = new Date(lDate.getFullYear(), 1, 29).getMonth() == 1;
            // Si Febrero tiene 28 días además la ultima fecha fue 29 o 30 de Marzo se aumenta un día a nuestro autocompletado (es la solución del bug)
            if (
              !isLeap &&
              lDate.getMonth() === 2 &&
              (lDate.getDate() === 29 || lDate.getDate() === 30)
            ) {
              autoDays += 1;
            }
            // Por cada día en el rango de días que necesitamos para completar la semana
            for (let i = 0; i < autoDays; i++) {
              if (
                $(
                  `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
                ).hasClass("disabled-custom") ||
                $(
                  `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
                ).hasClass("middle-day")
              ) {
                break;
              }

              // Se aumenta en un día la fecha del ultimo día seleccionado
              lDate.setDate(lDate.getDate() + 1);
              dates.push(lDate.toISOString().slice(0, 10));
              // Se busca el elemento con esa fecha y se le agrega una clase "autocomplete"
              $(
                `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
              ).addClass("autocomplete");
            }
          });
        }
        // Se saca el número de semanas
        if (Math.round((relativeSize + autoDays) / 7) > nWeeks) {
          Swal.fire({
            icon: "error",
            title: "error",
            text: `You can't select more than ${nWeeks} weeks`,
          }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
              dismissableDaily = true;
              resetDismissValue();
              whenInstance.trigger("reset:start:end");
            }
          });
        }
      }

      // Se filtran las fechas para evitar duplicados
      uniqueDates = new Set(dates);
      // Se obtienen los números de noches en caso de que solo se tenga una noche por defecto pondrá el número 1
      relativeSize = uniqueDates.size - 1 > 0 ? uniqueDates.size - 1 : 0;

      // Si el modo de selección es semanal
      if (mode === "hybrid") {
        // Si hay mas de 21 noches seleccionadas
        if (relativeSize > maxNights) {
          // Si faltan días para completar la semana
          if (relativeSize % 7 > 0) {
            // Buscamos la ultima fecha que seleccionamos y ejecutamos una función
            $(".activeRange.last").each((index, element) => {
              // Los días que faltan para completar la semana se obtienen
              autoDays = 7 - (relativeSize % 7);
              // Se obtiene la fecha de cada uno de los días restantes para completar la semana
              const lDate = new Date($(element).attr("data-val"));
              // Creamos una condicional para verificar si febrero tiene 28 o 29 días (Esto es necesario ya que de no hacer esta verificación un bug se hace presente)
              const isLeap =
                new Date(lDate.getFullYear(), 1, 29).getMonth() == 1;
              // Si Febrero tiene 28 días además la ultima fecha fue 29 o 30 de Marzo se aumenta un día a nuestro autocompletado (es la solución del bug)
              if (
                !isLeap &&
                lDate.getMonth() === 2 &&
                (lDate.getDate() === 29 || lDate.getDate() === 30)
              ) {
                autoDays += 1;
              }
              // Por cada día en el rango de días que necesitamos para completar la semana
              for (let i = 0; i < autoDays; i++) {
                if (
                  $(
                    `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
                  ).hasClass("disabled-custom") ||
                  $(
                    `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
                  ).hasClass("middle-day")
                ) {
                  break;
                }

                // Se aumenta en un día la fecha del ultimo día seleccionado
                lDate.setDate(lDate.getDate() + 1);
                dates.push(lDate.toISOString().slice(0, 10));
                // Se busca el elemento con esa fecha y se le agrega una clase "autocomplete"
                $(
                  `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
                ).addClass("autocomplete");
              }
            });
          }
          // Si el numero de semanas es mayor al límite
          if (Math.round((relativeSize + autoDays) / 7) > nWeeks) {
            // Se lanza una alerta
            Swal.fire({
              icon: "error",
              title: "error",
              text: `You can't select more than ${nWeeks} weeks`,
            }).then((result) => {
              if (result.isConfirmed || result.isDismissed) {
                // Si la alerta es cerrada
                dismissableDaily = true;
                // Se limpia el calendario
                resetDismissValue();
                whenInstance.trigger("reset:start:end");
              }
            });
          }
        }

        // Se filtran las fechas para evitar duplicados
        uniqueDates = new Set(dates);
        // Se obtienen los números de noches en caso de que solo se tenga una noche por defecto pondrá el número 1
        relativeSize = uniqueDates.size - 1 > 0 ? uniqueDates.size - 1 : 0;

        // Si el total de noches es menor al número de noches lanza una alerta
        // if (relativeSize < minNights) {
        //   // Si la fecha no es null lanza la alerta
        //   dateString !== null &&
        //     Swal.fire({
        //       icon: "error",
        //       title: "Error",
        //       text: `You must select at least ${minNights} nights`,
        //     }).then((result) => {
        //       if (result.isConfirmed || result.isDismissed) {
        //         // Si la alerta es cerrada
        //         dismissableDaily = true;
        //         // Limpia el calendario
        //         resetDismissValue();
        //         whenInstance.trigger("reset:start:end");
        //       }
        //     });
        // }
      }

      // Se agregan a nuestro arreglo temporal todas las fechas en el filtrado
      let setToArray = Array.from(uniqueDates);

      // Por cada día seleccionado
      for (let i = 0; i < setToArray.length; i++) {
        // Si el día es el pimero o ultimo seleccionado
        if (i === 0 || i === setToArray.length - 1) {
          // Si la fecha anterior a ese día no es válida
          if (
            $(`.day[data-val="${setToArray[i]}"]`)
              .prev()
              .attr("data-disabled") === "true"
          ) {
            // Se agrega al arreglo temporal como no fecha seleccionable
            selectedTemp.push({
              date: setToArray[i],
              selectable: false,
            });
          } else if (i === 0) {
            // Lo agrega al arreglo temporal como fecha seleccionable
            selectedTemp.push({
              date: setToArray[i],
              selectable: true,
              position: "first",
            });
          } else if (i === setToArray.length - 1) {
            selectedTemp.push({
              date: setToArray[i],
              selectable: true,
              position: "last",
            });
          }
        } else {
          // Si no es primero ni ultimo de nuestra selección se agrega al arreglo coo fecha no seleccionable
          selectedTemp.push({
            date: setToArray[i],
            selectable: false,
          });
        }
      }
      //selectedTemp.push(...uniqueDates);

      // Si el modo es diario
      if (mode === "daily") {
        // Si el tamaño de noches seleccionadas es mayor al número máximo de días
        if (relativeSize > maxNights) {
          dateString !== null &&
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `You can't select more than ${maxNights} nights`,
            }).then((result) => {
              if (result.isConfirmed || result.isDismissed) {
                dismissableDaily = true;
                resetDismissValue();
                whenInstance.trigger("reset:start:end");
              }
            });
        }

        // Si en modo diario el número de noches seleccionadas es menor al mínimo de noches
        // if (relativeSize < minNights) {
        //   // Si la fecha no es null se lanza una alerta
        //   dateString !== null &&
        //     Swal.fire({
        //       icon: "error",
        //       title: "Error",
        //       text: `You must select at least ${minNights} nights`,
        //     }).then((result) => {
        //       if (result.isConfirmed || result.isDismissed) {
        //         // Si la alerta es cerrada
        //         dismissableDaily = true;
        //         // Se limpia el calendario
        //         resetDismissValue();
        //         whenInstance.trigger("reset:start:end");
        //       }
        //     });
        // }
      }

      // Si se elige la misma noche
      // if (relativeSize < 1) {
      //   // Si la fecha no es null
      //   dateString !== null &&
      //     Swal.fire({
      //       icon: "error",
      //       title: "Error",
      //       text: "You must select at least one night",
      //     }).then((result) => {
      //       if (result.isConfirmed || result.isDismissed) {
      //         // Si la alerta es cerrada
      //         dismissableDaily = true;
      //         // Se limpia el calendario
      //         resetDismissValue();
      //         whenInstance.trigger("reset:start:end");
      //       }
      //     });
      // }

      // Se busca el input con el id "check_out" y cambiamos su valor al ultimo elemento con clase autocomplete, además de reemplazar los "-" por "/", todo realiado con jQuery, en caso de no encontrar autocompletado se coloca la ultima fecha seleccionada
      const lDateTemp = new Date(dates[dates.length - 1]);
      document.getElementById("check_out").value = `${formatDate(
        lDateTemp.setDate(lDateTemp.getDate() + 1)
      )}`;
      // Se busca el elemento con id "code-to" y cambiamos su innerText
      document.getElementById("code-to").innerText = `${formatDate(
        dateString
      )}`;
      // Si se seleccionaron los días usando el calendario se coloca en el selector de noches por defecto el número de noches
      if (setWeeklyComplete) {
        document.getElementById("n_nights").value = `${relativeSize}`;
      }

      for (let i = 0; i < dataSource.length; i++) {
        if (dataSource[i].selectable) {
          $(`.day[data-val='${dataSource[i].date}']`).addClass("middle-day");
        }
      }

      localStorage.removeItem("last");
      localStorage.removeItem("first");
    });

    whenInstance.on("firstDateSelect:after", (dateString) => {
      // Buscamos el input y el elemento con sus respectivos id y cambiamos su value e innerText a la primera fecha seleccionada
      document.getElementById("check_in").value = `${formatDate(dateString)}`;
      document.getElementById("code-from").innerText = `${formatDate(
        dateString
      )}`;
      // Si hacemos selección por calendario se establece en true
      setWeeklyComplete = true;
      const targetDate = new Date(dateString);
      const nextDate = new Date(dateString);
      nextDate.setDate(nextDate.getDate() + 1);

      if (
        $(`.day[data-val="${targetDate.toISOString().slice(0, 10)}"]`).hasClass(
          "middle-day"
        ) &&
        ($(`.day[data-val="${nextDate.toISOString().slice(0, 10)}"]`).hasClass(
          "disabled-custom"
        ) ||
          $(`.day[data-val="${nextDate.toISOString().slice(0, 10)}"]`).hasClass(
            "middle-day-last"
          ))
      ) {
        Swal.fire({
          title: "Date",
          icon: "info",
          text: formatDate(dateString),
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            whenInstance.trigger("change:startDate", new Date());
            whenInstance.trigger("change:endDate", new Date());
            whenInstance.trigger("reset:start:end");
          }
        });
      }

      for (let i = 0; i < dataSource.length; i++) {
        if (dataSource[i].selectable && dataSource[i].position === "last") {
          $(`.day[data-val="${dataSource[i].date}"]`).addClass(
            "middle-day-last"
          );
        } else if (
          dataSource[i].selectable &&
          dataSource[i].position === "first"
        ) {
          $(`.day[data-val="${dataSource[i].date}"]`).addClass("middle-day");
        }
      }
    });

    whenInstance.on("firstDateSelect:before", (dateString) => {
      // Limpiamos los autocomplete del calendario
      $(".autocomplete").removeClass("autocomplete");
      // La alerta de error se establece en falso
      dismissableDaily = false;

      for (let i = 0; i < dataSource.length; i++) {
        if (dataSource[i].selectable) {
          $(`.day[data-val='${dataSource[i].date}']`).addClass("middle-day");
        }
      }

      let lasts = dataSource.filter(
        (val) => val.position === "first" && val.selectable === true
      );
      let firsts = dataSource.filter(
        (val) => val.position === "last" && val.selectable === true
      );
      let lastsDates = lasts.map((val) => val.date);
      lastsDates = lastsDates.sort((a, b) => {
        let tempA = new Date(a);
        let tempB = new Date(b);
        return tempA - tempB;
      });
      let firstsDates = firsts.map((val) => val.date);
      firstsDates = firstsDates.sort((a, b) => {
        let tempA = new Date(a);
        let tempB = new Date(b);
        return tempB - tempA;
      });
      for (let i = 0; i < firstsDates.length; i++) {
        let currDate = new Date(dateString);
        let tempDate = new Date(firstsDates[i]);

        if (currDate > tempDate) {
          localStorage.setItem("first", firstsDates[i]);
          break;
        }
      }
      for (let i = 0; i < lastsDates.length; i++) {
        let currDate = new Date(dateString);
        let tempDate = new Date(lastsDates[i]);
        tempDate.setDate(tempDate.getDate() + 1);

        if (currDate < tempDate) {
          localStorage.setItem("last", lastsDates[i]);
          break;
        }
      }
    });

    //whenInstance = new When({
    //  // Seleccionamos el div que contendrá nuestro calendario
    //  container: document.getElementById("picker-input"),
    //  //keyboardEvents: true,
    //  // Establecemos que sea siempre visible
    //  inline: true,
    //  double: true,
    //  minDate: new Date(),
    //  disabledDates: blockedDays,
    //});

    // Se recarga el navegador (de no hacerlo no se mostrarán las fechas ocupadas)
    // window.location.reload();
    flaw = false;
  });

  // Cuando interactuamos con el selector de noches
  $("#n_nights").change(() => {
    // Se inhabilita el llenado de noches en el selector
    setWeeklyComplete = false;
    // Se limpian clases que ya no utilizamos
    $(".activeRange").removeClass("activeRange");
    $(".autocomplete").removeClass("autocomplete");
    // Se inicialia una variable Date con el valor de nuestra primera fecha seleccionada la cuál se extrae del textbox de check_in
    const nDate = new Date($("#check_in").val());
    // Se le agrega a esa fecha el valor de noches seleccionadas
    nDate.setDate(nDate.getDate() + parseInt($("#n_nights").val()));
    // Se crea una variable booleana para determinar si la fecha que estamos seleccionando está disponible
    const isDisabled = $(
      `.day[data-val="${nDate.toISOString().slice(0, 10)}"]`
    ).hasClass("disable-day");

    // Si esa fecha no está disponible
    if (isDisabled) {
      // Se lanza la alerta de fecha no disponible
      noSelectDates();
      // Se desenfoca el input de noches
      $("#n_nights").blur();
      // Se resetea la selección
      whenInstance.trigger("reset:start:end");
      // Se limpia el calendario
      resetDismissValue();

      whenInstance.trigger("reset:start:end");
    } else {
      // Si la fecha está disponible se realiza la selección
      whenInstance.trigger("change:endDate", nDate);
    }

    if (mode === "daily" && $("#n_nights").val() > maxNights) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `You can't select more than ${maxNights} Nights`,
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          dismissableDaily = true;
          resetDismissValue();

          whenInstance.trigger("reset:start:end");
        }
      });
    }

    //? noSelectDates()
    //: whenInstance.trigger("change:endDate", nDate);
  });
});
