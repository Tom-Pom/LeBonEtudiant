
var pointhashmap = {};
var map;

function initMap() {
    map = new google.maps.Map(map[0], {
        center: {lat: 48.8534100, lng: 2.3488000},
        zoom: 6
    });

    $.ajax({
        type: "POST",
        url: "AjaxServlet?action=lst_etab",
        success: function (data, textStatus, jqXHR) {
            $('<div>').append(jqXHR.responseText).find(".infoEtab").each(function () {
                var idetab = $(this).children(".idEtab").html();

                if (!pointhashmap[idetab])
                {
                    pointhashmap[idetab] = createPointOnMap(map, $(this).children(".latEtab").html(), $(this).children(".lonEtab").html(), idetab, $(this).children(".nomEtab").html());
                }
            })
        }
    });
}
var refreshAjax = function () {
    $.ajax({
        type: "POST",
        data: $("#mainwrap").serialize(),
        url: "AjaxServlet",
        success: function (data, textStatus, jqXHR) {
            $('#mainxjspreceiver').html(data);
            var newpointhashmap = {}

            var jqInfoEtabs = $("<div>" + jqXHR.responseText + "</div>").find(".infoetab");


            jqInfoEtabs.each(function () {
                var idetab = $(this).children(".idEtab").html();
                newpointhashmap[idetab] = "point!"
            });

            for (var k in pointhashmap) {
                if (newpointhashmap[k] && !pointhashmap[k].map)
                {
                    pointhashmap[k].setMap(map)
                }
                else if (!newpointhashmap[k])
                {

                    pointhashmap[k].setMap(null);
                }
            }



        },
    });
}
var timer;

var majmainresults = function (e) {

    clearTimeout(timer);
    timer = setTimeout(refreshAjax, 150);


}

$("body").on('submit', "form[name='infowindowsearch']", function (e) {
    e.preventDefault();
    var container = $(this).children(".infowindowResult");
    $.ajax({
        url: "AjaxServlet",
        type: 'POST',
        data: $(this).serialize(),
        success: function (responseHTML, status, xhr)
        {
            container.html(responseHTML);
        }

    })
});
submitMiniSearch = function ()
{
    $(this).parent().parent().submit();
}

var image = 'img/Immeuble_small.png';
var openWindow = undefined;
function createPointOnMap(paramap, latitude, longitude, UAI, nom)
{
    //console.log(latitude + " " + longitude + " " + UAI);
    var xsltReceiver = $("#infoWindOrigin").clone();
    xsltReceiver.attr('id', "")
            .prepend("<h4>" + nom + "<h4>")
            .children("input[name='etabSelectSearch']").val(UAI);

    xsltReceiver.find("input[name='searchtitre']").keyup(submitMiniSearch);

    var infowindow = new google.maps.InfoWindow({
        content: xsltReceiver[0]
    });
    var marker = new google.maps.Marker({
        position: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
        map: paramap,
        icon: image,
        title: nom
    });
    marker.addListener('click', function () {
        if (openWindow)
            openWindow.close();
        openWindow = infowindow;
        infowindow.open(paramap, marker);
        xsltReceiver.submit();
    });
    return marker;
}
function ajaxAnonceDemandeVente(idAnnonce, typeAnnonce, typeres, container)
{
    $.ajax({
        url: "AjaxServlet",
        type: 'POST',
        data: {
            idAnnonce: idAnnonce,
            typeAnnonce: typeAnnonce,
            typeres: typeres,
            action: "annonce",
        },
        success: function (responseHTML, status, xhr)
        {
            container.html(responseHTML);
            if (container.find('input.datepicker'))
            {
                $('input.datepicker').datepicker($.datepicker.regional[ "fr" ]);
            }
            var amount = parseFloat(container.find("input[name='amountAnnonce']").val());
            container.find("#slider-vente").slider({
                value: amount,
                max: 20000,
                orientation: "horizontal",
                range: "min",
                animate: true,
                slide: slidEVente
            });
            sliDemande(undefined,{value:amount});
            container.find("#slider-demande").slider({
                value: amount,
                max: 20000,
                orientation: "horizontal",
                range: "min",
                animate: true,
                slide: sliDemande
            });
            slidEVente(undefined,{value:amount});
            container.find("#etabSelectDemande,#etabSelectVente,#categSelect-vente, #categSelect-demande").multiselect(
                    {
                        enableCaseInsensitiveFiltering: true,
                        maxHeight: 600,
                        includeSelectAllOption: true
                    });
        }

    })
}
$("body").on("click", "button[data-target='#modalVente'],.btn.btn-warning.effacerForm-Vente", function () {
    ajaxAnonceDemandeVente("-1", "vente", "edit", $('#mcvente'));
}).on("click", ".confirmAnnonceOverlayFooter .btn.btn-warning.editVente", function () {
    ajaxAnonceDemandeVente($("#mcvente  input[name='idAnnonce']").val(), "vente", "edit", $('#mcvente'));
}).on("click", "button[data-target='#modalDemande'],.btn.btn-warning.effacerForm-Demande", function () {
    ajaxAnonceDemandeVente("-1", "demande", "edit", $('#mcdemande'));
}).on("click", ".confirmAnnonceOverlayFooter .btn.btn-warning.editDemande", function () {
    ajaxAnonceDemandeVente($("#mcdemande input[name='idAnnonce']").val(), "demande", "edit", $('#mcdemande'));
}).on("click", "table.tableResultAnnonce tr", function () {
$('#modalDemande').modal();
    ajaxAnonceDemandeVente($(this).find(".idAnnonce").html(), "demande", "show", $('#mcdemande'));
})

$(document).ready(function () {

    map = $("#map");

    $("#radioGroupSelecTypAnn").buttonset();
//Code à exécuter apres le chargement de la page

    $(".dropdown-menu").mouseenter(function () {
        $(this).parent().children(".dropdown-toggle").attr("data-toggle", "");
    }
    ).mouseleave(function () {
        $(this).parent().children(".dropdown-toggle").attr("data-toggle", "dropdown");
    });
    rangevalues = [0, 20000];
    sliderRange = $("#slider-range").slider({
        range: true,
        min: 0,
        max: 30000,
        values: rangevalues,
        slide: slidERange
    });
    $("input[name='prixmin-search']").val(rangevalues[0]);
    $("input[name='prixmax-search']").val(rangevalues[ 1 ]);
    
    $("#amount").val("Entre " + $("#slider-range").slider("values", 0) +
            "€ et " + $("#slider-range").slider("values", 1) + "€");




    var password = document.getElementById("password")
            , confirm_password = document.getElementById("confirm_password");
    function validatePassword() {
        if (password.value != confirm_password.value) {
            confirm_password.setCustomValidity("Le mot de passe ne correspond pas");
        } else {
            confirm_password.setCustomValidity('');
        }
    }

    if (password && confirm_password)
    {
        password.onchange = validatePassword;
        confirm_password.onkeyup = validatePassword;
    }


    $('#regionSelectSearch,#deptSelectSearch,#villeSelectSearch,#categSelect,#etabSelectSearch, #registerRegionSelect').multiselect(
            {
                enableCaseInsensitiveFiltering: true,
                maxHeight: 600,
                includeSelectAllOption: true
            });
    if (document.getElementById('map')) {
        initMap()
    };
    $("#maincontainer").on('change', 'input', majmainresults).on('keyup', "input[type='text']", majmainresults);

});

var slidEVente = function (event, ui) {
    $("#amount-annonce-vente").val(ui.value + " €");
    $("#hidden-amount-annonce-vente").val(ui.value);
}

var sliDemande = function (event, ui) {
    $("#amount-annonce-demande").val(ui.value + " €");
    $("#hidden-amount-annonce-demande").val(ui.value);
}
    var slidERange = function (event, ui) {
        $("#amount").val("Entre " + ui.values[ 0 ] + "€ et " + ui.values[ 1 ] + "€");
        $("input[name='prixmin-search']").val(ui.values[ 0 ]);
        $("input[name='prixmax-search']").val(ui.values[ 1 ]);
        majmainresults();
    }

//*****pagination*******//
$("body").on('click', "form[name='listUserPagin'] .pagination li,form[name='listAdPagin']  .pagination li", function () {

    $('input[name="pageCourante"]').val($(this).attr("data"));
    $("form[name='listAdPagin'],form[name='listUserPagin']").submit();
});
$("body").on('change', "form[name='listUserPagin'] select[name='nbResultPage'],form[name='listAdPagin'] select[name='nbResultPage']", function () {
    $("form[name='listAdPagin'],form[name='listUserPagin']").submit();
});
$("body").on('submit', "form[name='listAdPagin'], form[name='listUserPagin']", function (e) {
    e.preventDefault();
    var container = $(this).parent();
    $.ajax({
        url: "AjaxServlet",
        type: 'POST',
        data: $(this).serialize(),
        success: function (responseHTML, status, xhr)
        {
            container.html(responseHTML);
        }

    })
});
$("body").on("submit", '#formDemande,#formVente', function (ev) {
    ev.preventDefault();
    var container = $(this).parent();
    //Code d'envoi ici
    $.ajax({
        type: "POST",
        url: $(this).attr('action'),
        data: $(this).serialize(),
        success: function (reponse) {
            container.html(reponse);
        }
    });
});
