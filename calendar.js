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

// Esta función le da formato "YYYY/MM/DD" a la fecha
const formatDate = (date) => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("/");
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
  // Este arreglo extrae las fechas ocupadas del LocalStorage, en caso de que no exista en LocalStorage se inicializa como arreglo vacío, este arreglo tendrá todas las fechas ocupadas
  let blockedDays = JSON.parse(localStorage.getItem("blockedDays")) || [];
  // Esta variable establece el minimo de noches, en este caso 1
  let minNights = 7;
  // Esta variable establece el máximo de noches, en este caso 100
  let maxNights = 100;
  // La varibale que va a disparar nuestras alertas se inicializa como false
  let dismissableDaily = false;
  // Esta variable va a identifar si se usa en modo semanal el selector de noches en el input o en el calendario
  let setWeeklyComplete = true;
  // Esta variable establece el modo de selección del calendario ya sea semanal ("weekly"), diario ("daily") o hibrido ("hybrid")
  let mode = "weekly";
  // Esta variable establece el número de semanas
  let nWeeks = 0;
  // Inicializamos un arreglo temporal donde se guardarán las fechas seleccionadas
  let selectedTemp = [];
  // Se crea nuestro calendario
  let whenInstance = new When({
    // Seleccionamos el div que contendrá nuestro calendario
    container: document.getElementById("picker-input"),
    //keyboardEvents: true,
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

  whenInstance.on("secondDateSelect:before", (dateString) => {
    $(".autocomplete").removeClass("autocomplete");
  });

  // Despues de seleccionar un rango de fechas se ejecuta una función que pasa como parametro la ultima fecha del rango
  whenInstance.on("secondDateSelect:after", (dateString) => {
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
            // Se aumenta en un día la fecha del ultimo día seleccionado
            lDate.setDate(lDate.getDate() + 1);
            // Se busca el elemento con esa fecha y se le agrega una clase "autocomplete"
            $(`.day[data-val="${lDate.toISOString().slice(0, 10)}"]`).addClass(
              "autocomplete"
            );
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
      // Se saca el número de semanas
      nWeeks = Math.round((relativeSize + autoDays) / 7);
      console.log(nWeeks);
    }

    // Si el modo de selección es semanal
    if (mode === "hybrid") {
      // Si hay mas de 21 noches seleccionadas
      if (uniqueDates.size > 21) {
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
        // Se saca el número de semanas
        nWeeks = Math.round((relativeSize + autoDays) / 7);
        console.log(nWeeks);
      }
    }

    // Se vuelve a inicializar el filtrado de fechas unicas para agregar las fechas que se seleccionaron en modo semanal, en caso de no agregar ninguna en modo semanal el filtrado no será modificado
    uniqueDates = new Set(dates);
    // Se agregan a nuestro arreglo temporal todas las fechas en el filtrado a través de la dispersión de ES6
    selectedTemp.push(...uniqueDates);

    // Si el modo es diario
    if (mode === "daily") {
      // Si el tamaño de noches seleccionadas es mayor a 31
      if (relativeSize > 31) {
        // Lanza una alerta
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "You Can't Select More Than 31 Nights",
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            // Cuando la alerta es cerrada o aceptada limpia el calendario
            dismissableDaily = true;
            resetDismissValue();
          }
        });
      }
    }

    // Mismo caso unicamente cambiando la condición a si la cantidad de noches seleccionadas es menor al mínimo de noches
    //if (relativeSize < minNights) {
       //Si la ultima fecha de selección no es nula se lanza la alerta
      //dateString !== null &&
        //Swal.fire({
          //icon: "error",
          //title: "Error",
          //text: `You must select at least ${minNights} Nights`,
        //}).then((result) => {
          //if (result.isConfirmed || result.isDismissed) {
            //dismissableDaily = true;
            //resetDismissValue();
          //}
        //});
    //}

    if (relativeSize < 1) {
      dateString !== null &&
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "You must select at least one night",
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            dismissableDaily = true;
            resetDismissValue();
          }
        });
    }

    // Mismo caso unicamente cambiando la condición a si excede el máximo de noches
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

    // Se busca el input con el id "check_out" y cambiamos su valor al ultimo elemento con clase autocomplete, además de reemplazar los "-" por "/", todo realiado con jQuery, en caso de no encontrar autocompletado se coloca la ultima fecha seleccionada
    $(".autocomplete").length > 0
      ? (document.getElementById("check_out").value = `${formatDate(
          $(".autocomplete").last().attr("data-val")
        )}`)
      : (document.getElementById("check_out").value = `${formatDate(
          dateString
        )}`);
    // Se busca el elemento con id "code-to" y cambiamos su innerText
    $(".autocomplete").length > 0
      ? (document.getElementById("code-to").innerText = `${formatDate(
          $(".autocomplete").last().attr("data-val")
        )}`)
      : (document.getElementById("code-to").innerText = `${formatDate(
          dateString
        )}`);
    // Se busca el input con id "n_nights" y cambiamos su valor al número de noches incluyendo el autocompletado
    //document.getElementById("n_nights").value = `${relativeSize + autoDays}`;
    // Si se seleccionaron los días usando el calendario se coloca en el selector de noches por defecto el número de noches
    if (setWeeklyComplete) {
      document.getElementById("n_nights").value = `${relativeSize + autoDays}`;
    }
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
  });

  // Antes de seleccionar nuestra primera fecha
  whenInstance.on("firstDateSelect:before", (dateString) => {
    // Limpiamos los autocomplete del calendario
    $(".autocomplete").removeClass("autocomplete");
    // La alerta de error se establece en falso
    dismissableDaily = false;
  });

  // Cuando se presiona el botón con el id "create_event"
  document.getElementById("create_event").addEventListener("click", () => {
    // En nuestro arreglo almacenado en LocalStorage se agregan todas nuestras fechas seleccionadas
    blockedDays.push(...selectedTemp);
    // Ese arreglo se almacena en LocalStorage escribiendo o sobre-escribiendo el que teníamos
    localStorage.setItem("blockedDays", JSON.stringify(blockedDays));
    // Se recarga el navegador (de no hacerlo no se mostrarán las fechas ocupadas)
    window.location.reload();
  });

  // Cuando se navege al siguiente mes
  $(".icon.icon-right-triangle").click(() => {
    // Buscamos todas las fechas bloqueadas
    for (let i = 0; i < blockedDays.length; i++) {
      // A todas las fechas ocupadas se les agrega la clase "disabled-custom" para agregarle el fondo rojo
      $(`.day[data-val='${blockedDays[i]}']`).addClass("disabled-custom");
    }

    // Por cada fecha pasada
    for (let i = 0; i < disables.length; i++) {
      // Se agrega una función al hacerle click para mandar una alerta
      disables[i].addEventListener("click", clickLockedDays);
    }

    // Si se mostró la alerta de error
    if (dismissableDaily) {
      // Se limpia el calendario
      resetDismissValue();
    }
  });

  // Cuando se navega al mes anterior
  $(".icon.icon-left-triangle").click(() => {
    // A todas las fechas ocupadas se les agrega la clase "disabled-custom" para agregarle el fondo rojo
    for (let i = 0; i < blockedDays.length; i++) {
      $(`.day[data-val='${blockedDays[i]}']`).addClass("disabled-custom");
    }

    // Por cada fecha pasada
    for (let i = 0; i < disables.length; i++) {
      disables[i].addEventListener("click", clickLockedDays);
    }

    // Si se mostró la alerta de error
    if (dismissableDaily) {
      // Se limpia el mapa
      resetDismissValue();
    }
  });

  // Cuando se presiona la tecla "esc"
  //$(document).keyup(function (e) {
    //if (e.key === "Escape") {
       //Se eliminan los autocompletados
      //$(".autocomplete").removeClass("autocomplete");
    //}
  //});

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
    } else {
      // Si la fecha está disponible se realiza la selección
      whenInstance.trigger("change:endDate", nDate);
    }

    if ($("#n_nights").val() > maxNights) {
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

    //? noSelectDates()
    //: whenInstance.trigger("change:endDate", nDate);
  });
});
