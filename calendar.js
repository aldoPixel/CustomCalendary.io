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
    text: `Date ${val} Not Available`,
  });
};

// Este método se usa para cuando estamos seleccionando un rango de fechas y nuestra fecha final no puede ser seleccionada
const noSelectDates = () =>
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Dates Not Available",
  });

// Esta función de usa para limpiar el calendario de marcadores una vez que se cancele la selección o salte una alerta, se hace uso de Jquery y JS DOM
const resetDismissValue = () => {
  $(".activeRange").removeClass("activeRange");
  $(".active").removeClass("active");
  $(".first").removeClass("first");
  $(".last").removeClass("last");
  dismissableDaily = true;
  relativeSize = 0;
  selectedTemp = [];
  document.getElementById("check_out").value = "";
  document.getElementById("code-to").innerText = "";
  document.getElementById("n_nights").value = "";
  document.getElementById("check_in").value = "";
  document.getElementById("code-from").innerText = "";
};

// Una vez que se carga todo el contenido de la página se ejecuta la función posteriormente establecida
document.addEventListener("DOMContentLoaded", () => {
  // Mandamos una señal de que nuestra página está renderizada
  console.log("DOM fully loaded and parsed");
  // Este arreglo extrae las fechas ocupadas del LocalStorage, en caso de que no exista en LocalStorage se inicializa como arreglo vacío, este arreglo tendrá todas las fechas ocupadas
  let blockedDays = JSON.parse(localStorage.getItem("blockedDays")) || [];
  // Esta variable extrae el mínimo de noches del LocalStorage, en caso de no existir en LocalStorage se inicializa en 0
  let minNights = localStorage.getItem("minNights") || 0;
  // Esta variable extrae el máximo de noches del LocalStorage, en caso de no existir en LocalStorage se inicializa en 0
  let maxNights = localStorage.getItem("maxNights") || 100;
  // La varibale que va a disparar nuestras alertas se inicializa como false
  let dismissableDaily = false;
  // Se extrae el modo del LocalStorage, en caso de no existir en LocalStorage se establece en modo "weekly" (semanal)
  const mode = localStorage.getItem("mode")
    ? localStorage.getItem("mode")
    : "weekly";
  // Inicializamos un arreglo temporal donde se guardarán las fechas seleccionadas
  let selectedTemp = [];
  // Se crea nuestro calendario
  let whenInstance = new When({
    // Seleccionamos el div que contendrá nuestro calendario
    container: document.getElementById("picker-input"),
    keyboardEvents: true,
    // Establecemos que sea siempre visible
    inline: true,
    // Establecemos que se muestren dos meses por página
    double: true,
    // Establecemos que la fecha mínima de selección sea el día de hoy
    minDate: new Date(),
    // Pasamos nuestro arreglo obtenido del LocalStorage como fechas bloqueadas
    disabledDates: blockedDays,
  });

  // Por cada día reservado en el LocalStorage
  for (let i = 0; i < blockedDays.length; i++) {
    // Seleccionamos con jQuery a través de template Strings de ES6 todos los días que tengan como atributo "data-val" la fecha del día bloqueado y le añadimos una clase disabled-custom, la cuál pintará de rojo todas las fechas ocupadas
    $(`.day[data-val='${blockedDays[i]}']`).addClass("disabled-custom");
  }

  // Obtenemos todos los elementos con la clase "disable-day" los cuales son días no válidos para seleccionar, ya sean fechas pasadas u ocupadas
  const disables = document.getElementsByClassName("disable-day");

  // Por cada elemento con clase "disable-day"
  for (let i = 0; i < disables.length; i++) {
    // Le agregamos la función definida al inicio conocida como "clickLockedDays" cuando se haga click en un día no válido
    disables[i].addEventListener("click", clickLockedDays);
  }

  // Despues de seleccionar un rango de fechas se ejecuta una función que pasa como parametro la ultima fecha del rango
  whenInstance.on("secondDateSelect:after", (dateString) => {
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
    let relativeSize = uniqueDates.size - 1 > 0 ? uniqueDates.size - 1 : 1;
    // Se inicializa una variable para los días de autocompletado en modo semanal
    let autoDays = 0;

    // Si el modo de selección es semanal
    if (mode === "weekly") {
      // Si hay mas de 21 noches seleccionadas
      if (uniqueDates.size >= 22) {
        // Si faltan días para completar la semana
        if (relativeSize % 7 > 0) {
          // Buscamos la ultima fecha que seleccionamos y ejecutamos una función
          $(".last").each((index, element) => {
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
              // Se aumenta en un día la fecha del ultimo día seleccionado
              lDate.setDate(lDate.getDate() + 1);
              // Se busca el elemento con esa fecha y se le agrega una clase "autocomplete"
              $(
                `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
              ).addClass("autocomplete");
              // Agregamos esa fecha a nuestro arreglo de fechas seleccionadas
              dates.push(lDate.toISOString().slice(0, 10));
            }
            // Como solución a otro bug es necesario buscar todos los días después de nuestra ultima fecha seleccionada y agregar la clase "autocomplete" a los días necesarios para completar la semana
            $(element)
              .nextAll(".day")
              .slice(0, autoDays)
              .addClass("autocomplete");
          });
        }
      }
    }

    // Se vuelve a inicializar el filtrado de fechas unicas para agregar las fechas que se seleccionaron en modo semanal, en caso de no agregar ninguna en modo semanal el filtrado no será modificado
    uniqueDates = new Set(dates);

    selectedTemp.push(...uniqueDates);

    if (mode === "daily") {
      if (relativeSize > 31) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "You Can't Select More Than 31 Nights",
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            dismissableDaily = true;
            resetDismissValue();
          }
        });
      }
    }

    if (relativeSize < minNights) {
      dateString !== null &&
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `You must select at least ${minNights} Nights`,
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            dismissableDaily = true;
            resetDismissValue();
          }
        });
    }

    if (relativeSize > maxNights) {
      dateString !== null &&
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `You can't select more than ${maxNights} Nights`,
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            dismissableDaily = true;
            resetDismissValue();
          }
        });
    }

    document.getElementById("check_out").value = `${dates[dates.length - 1]}`;
    document.getElementById("code-to").innerText = `${dates[date.length - 1]}`;
    document.getElementById("n_nights").value = `${relativeSize + autoDays}`;
  });

  whenInstance.on("firstDateSelect:after", (dateString) => {
    document.getElementById("check_in").value = `${dateString}`;
    document.getElementById("code-from").innerText = `${dateString}`;
  });

  whenInstance.on("firstDateSelect:before", (dateString) => {
    $(".autocomplete").removeClass("autocomplete");
    dismissableDaily = false;
  });

  document.getElementById("create_event").addEventListener("click", () => {
    blockedDays.push(...selectedTemp);
    localStorage.setItem("blockedDays", JSON.stringify(blockedDays));
    window.location.reload();
  });

  $(".icon.icon-right-triangle").click(() => {
    for (let i = 0; i < blockedDays.length; i++) {
      $(`.day[data-val='${blockedDays[i]}']`).addClass("disabled-custom");
    }

    for (let i = 0; i < disables.length; i++) {
      disables[i].addEventListener("click", clickLockedDays);
    }

    if (dismissableDaily) {
      resetDismissValue();
    }
  });

  $(".icon.icon-left-triangle").click(() => {
    for (let i = 0; i < blockedDays.length; i++) {
      $(`.day[data-val='${blockedDays[i]}']`).addClass("disabled-custom");
    }

    for (let i = 0; i < disables.length; i++) {
      disables[i].addEventListener("click", clickLockedDays);
    }

    if (dismissableDaily) {
      resetDismissValue();
    }
  });
});
