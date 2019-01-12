// earc slicer - Vue.js - three.js app by earc - (core: Jan Kovar) - 2018

var camera, scene, renderer, control; var model;
var cameraTarget, selected_object, exporter, container, stats;
var selected_object_obj, saveString, gcode_view;

var hover_over_element = "";
var hover_over_element_text = "";
var gcode_print_time;

let mainWindow = null;
const Electron = require('electron');

var cmd = require('node-cmd');
const fs = require('fs');
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;
var os = require('os');
var ini = require('ini');
const path = require('path');

const { remote } = require('electron');
const { Menu, MenuItem } = remote;

const electron = require('electron');
const ipc = electron.ipcRenderer;

var basepath = remote.app.getAppPath();

var loaded_models = {};
loaded_models.model = [];

var define_inport_click_var;

var flag=false;
var layer;

setTimeout(function(){
    init();
    animate();
}, 400);

function init() {

    console.log("os_core: ", os.type());

    var space_x = 200;
    var space_y = 200;
    var space_height = 200;

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0xffffff );
	//renderer.setSize( 800, 500 );
	//renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setSize( Math.round((window.innerWidth/100)*72), window.innerHeight );
	document.body.appendChild( renderer.domElement );

    setTimeout(function(){
        window.addEventListener( 'resize', onWindowResize, false );
    }, 600);

    function onWindowResize(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

	//camera = new THREE.PerspectiveCamera( 30, 800 / 500, 1, 2000 );
	camera = new THREE.PerspectiveCamera( 30, Math.round((window.innerWidth/100)*74) / window.innerHeight, 1, 3000 );
	camera.position.set( 260, 280, 360 );
    //camera.up = new THREE.Vector3( 0, 0, 1 ); // x y z

    exporter = new THREE.STLExporter();

    $(document).on('click','#camera_presp_view', function(){
        camera.position.set( 260, 280, 360 );
    })

    $(document).on('click','#camera_top_view', function(){
        camera.position.set( 0, 500, 0 );
    })

    $(document).on('click','#camera_front_view', function(){
        camera.position.set( 0, 0, 500 );
    })

    $(document).on('click','#camera_side_view', function(){
        camera.position.set( 500, 0, 0 );
    })

	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	control = new THREE.OrbitControls( camera, renderer.domElement );
	control.rotateSpeed = 1;
	control.enableZoom = true;
	control.zoomSpeed = 1.2;
	control.enableDamping = false;
	//control.minPolarAngle = Math.PI / 3;
	//control.maxPolarAngle = Math.PI / 3;

	scene = new THREE.Scene();

	var light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set( 0, 800, 1000 );
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set( 0, 800, -1000 );
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set( 550, 800, 0 );
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set( -550, 800, 0 );
	scene.add( light );

	var light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );


	// world

	var Texture = new THREE.ImageUtils.loadTexture( 'assets/img/grid.png' );
	Texture.wrapS = Texture.wrapT = THREE.RepeatWrapping;
	Texture.repeat.set( 1, 1 );	Texture.offset.set( 0, 0 );

	var Material = new THREE.MeshBasicMaterial( { map: Texture, side: THREE.DoubleSide } );
	var Geometry = new THREE.PlaneGeometry( space_x, space_y, 1, 1 );

	var checkerboard = new THREE.Mesh( Geometry, Material );
	checkerboard.position.y = - 0.1;
	checkerboard.rotation.x =  Math.PI / 2;
	//checkerboard.position.x =  -x_plate / 2;
	//checkerboard.position.z =  y_plate / 2;
	scene.add( checkerboard );

    var material = new THREE.LineBasicMaterial( { color: 0xD2D2D2 } );
    var geometry = new THREE.Geometry();
                                        //     x  z   y
    geometry.vertices.push(new THREE.Vector3( space_x/2, 0, space_y/2) );
    geometry.vertices.push(new THREE.Vector3( space_x/2, space_height, space_y/2) );
    geometry.vertices.push(new THREE.Vector3( space_x/2, space_height, -space_y/2) );
    geometry.vertices.push(new THREE.Vector3( space_x/2, 0, -space_y/2) );
    geometry.vertices.push(new THREE.Vector3( -space_x/2, 0, -space_y/2) );
    geometry.vertices.push(new THREE.Vector3( -space_x/2, space_height, -space_y/2) );
    geometry.vertices.push(new THREE.Vector3( -space_x/2, space_height, space_y/2) );
    geometry.vertices.push(new THREE.Vector3( -space_x/2, 0, space_y/2) );
    geometry.vertices.push(new THREE.Vector3( -space_x/2, space_height, space_y/2) );
    geometry.vertices.push(new THREE.Vector3( space_x/2, space_height, space_y/2) );
    geometry.vertices.push(new THREE.Vector3( space_x/2, space_height, -space_y/2) );
    geometry.vertices.push(new THREE.Vector3( -space_x/2, space_height, -space_y/2) );
    //geometry.vertices.push(new THREE.Vector3( 10, 0, 0) );

    var line = new THREE.Line( geometry, material );
    scene.add( line );

	ObjectControl1 = new ObjectControls( camera, renderer.domElement );
	ObjectControl1.projectionMap = checkerboard; ObjectControl1.fixed.y = true;

	var object3D = new THREE.Object3D;
	var mesh = new THREE.Mesh( geometry, material );
	object3D.add( mesh );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.y = h; mesh.rotation.x = Math.PI / 2; mesh.rotation.z = Math.PI / 2;
	object3D.add( mesh );
	object3D.position.set( 25, h / 2, 175 );
	scene.add( object3D );  ObjectControl1.attach( object3D );


	ObjectControl2 = new ObjectControls( camera, renderer.domElement );
	ObjectControl2.projectionMap = checkerboard; ObjectControl2.fixed.y = true;
	ObjectControl2.move = function() {

		this.container.style.cursor = 'move'
		this.focused.position.x = 25 + 50 * Math.round( ( this.focused.position.x - 25 ) / 50 );
		this.focused.position.z = 25 + 50 * Math.round( ( this.focused.position.z - 25 ) / 50 );

	}

	ObjectControl2.mouseup = function() {

		var x = ( this.focused.position.x - 25 ) / 50;
		var z = ( this.focused.position.z - 25 ) / 50;

		var sum = Math.abs( ( x + z ) % 2 );
		if ( sum == 0 ) { this.returnPrevious() }
		this.container.style.cursor = 'auto';

	}

	ObjectControl2.onclick = function() {

		console.log( this.focused.name );
		if ( this.focusedpart != null ) console.log( this.focusedpart.name )
			else  console.log( 'this.focusedpart is null' );

	}

    var h;
	var mesh_pos, mesh_box;

    setTimeout(function(){
        define_inport_click();
    }, 600);    // wait for react to make the element

    define_inport_click_var = function() {
        $('#import_label').on('click', function() {
            console.log('>> import model');
            var file_path = dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] })[0];
            console.log(file_path);

                var file_name = file_path.split('/');
                file_name = file_name[file_name.length-1];

                console.log(file_name);

                var ext = file_name.slice((file_name.lastIndexOf(".") - 1 >>> 0) + 2);
                if(ext == "stl"){
                    console.log("ext --> ." + ext + " -> OK");
                    load_stl_model(file_path, file_name);
                } /*
                else if(ext == "obj"){              // EXPERIMENTAL --> disabled
                    console.log("ext --> ." + ext + " -> OK");
                    load_obj_model(f.path, f.name);
                } */

                else {
                    console.log("ERROR --> Unsupported File --> ." + ext);
                    alert("Unsupported File --> ." + ext + "  (only .stl)");
                }
        });
    };

    function define_inport_click(){
        $('#import_label').on('click', function() {
            console.log('>> import model');
            var file_path = dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] })[0];
            console.log(file_path);

                var file_name = file_path.split('/');
                file_name = file_name[file_name.length-1];

                console.log(file_name);

                var ext = file_name.slice((file_name.lastIndexOf(".") - 1 >>> 0) + 2);
                if(ext == "stl"){
                    console.log("ext --> ." + ext + " -> OK");
                    load_stl_model(file_path, file_name);
                } /*
                else if(ext == "obj"){              // EXPERIMENTAL --> disabled
                    console.log("ext --> ." + ext + " -> OK");
                    load_obj_model(f.path, f.name);
                } */

                else {
                    console.log("ERROR --> Unsupported File --> ." + ext);
                    alert("Unsupported File --> ." + ext + "  (only .stl)");
                }
        });
    }

    ipcRenderer.on('import_model_fc', function (ev, data) {
        console.log('>> import model');
        var file_path = dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] })[0];
        console.log(file_path);

            var file_name = file_path.split('/');
            file_name = file_name[file_name.length-1];

            console.log(file_name);

            var ext = file_name.slice((file_name.lastIndexOf(".") - 1 >>> 0) + 2);
            if(ext == "stl"){
                console.log("ext --> ." + ext + " -> OK");
                load_stl_model(file_path, file_name);
            } /*
            else if(ext == "obj"){              // EXPERIMENTAL --> disabled
                console.log("ext --> ." + ext + " -> OK");
                load_obj_model(f.path, f.name);
            } */

            else {
                console.log("ERROR --> Unsupported File --> ." + ext);
                alert("Unsupported File --> ." + ext + "  (only .stl)");
            }

    });

    function load_stl_model(model_file_path, model_file_name){

        var file_path = model_file_path;

        for(var i = 0; i < loaded_models.model.length; i++){
            loaded_models.model[i].name == model_file_name ? model_file_name = "(cp)" + model_file_name : model_file_name = model_file_name;
        }

        $("#model_list_div").append("<li id='model_li' class='model_menu_li'><p id='model_li_p'>" + model_file_name + "</p><div class='cross_icon del_model_btn' id='" + model_file_name + "'></div></li>");

        loaded_models.model.push({ name: model_file_name, path: file_path });   // add object to array with properties

        console.log(loaded_models);

        var loader = new THREE.STLLoader();
		loader.load( file_path, function ( geometry ) {

			var material = new THREE.MeshPhongMaterial( { color: 0x00BAFF, specular: 0x111111, shininess: 200 } );
			var mesh = new THREE.Mesh( geometry, material );

            model_file_name == "gcode_view" ? model_file_name = "gcode_model" : model_file_name = model_file_name;
            mesh.name = model_file_name;

            console.log(model_file_name);
            selected_object = model_file_name;

			mesh.rotation.set( Math.PI*1.5, 0, 0 );
			mesh.scale.set( 1, 1, 1 );

			mesh.castShadow = true;
			mesh.receiveShadow = true;

			var box = new THREE.Box3().setFromObject( mesh );

            console.log("---> - height: " + box.min.y);
            console.log("---> + height: " + box.max.y);

            if(box.min.y < 0){
                mesh.position.set( 0, -(box.min.y), 0 );
            } else if(box.min.y > 0){
                mesh.position.set( 0, -(box.min.y), 0 );
            } else {
                mesh.position.set( 0, 0, 0 );
            }

            console.log("------ ");
            console.log("---> pos: " + mesh.position.y);

            var box = new THREE.Box3().setFromObject( mesh );

            var helper = new THREE.Box3Helper( box, 0xffff00 );
            //scene.add( helper );
            //console.log(helper.position);

			scene.add( mesh ); ObjectControl1.attach( mesh );

			if ( mesh instanceof THREE.Mesh ) {
               mesh_pos = mesh; // set value to the global variable, applicable, if the objMesh has one child of THREE.Mesh()
        	}

            selected_object_obj = mesh_pos;

		} );

    }

    function load_obj_model(model_file_path, model_file_name){      // EXPERIMENTAL --> disabled

        $("#model_list_div").append("<li id='model_li' class=''>" + model_file_name + "</li>");

        loaded_models.model.push({ name: model_file_name, path: file_path });   // add object to array with properties

        console.log(loaded_models);


        var loader = new THREE.OBJLoader()
            loader.load( file_path, function ( mesh ) {

                var color = new THREE.Color( 0x00BAFF );
                mesh.traverse( function ( child ) {
                    if ( child.isMesh ) child.material.color = color;
                } );

                model_file_name == "gcode_view" ? model_file_name = "gcode_model" : model_file_name = model_file_name;
                mesh.name = model_file_name;

                console.log(model_file_name);
                selected_object = model_file_name;

    			mesh.rotation.set( Math.PI*1.5, 0, 0 );
    			mesh.scale.set( 1, 1, 1 );

    			mesh.castShadow = true;
    			mesh.receiveShadow = true;


    			var box = new THREE.Box3().setFromObject( mesh );

                console.log("---> - height: " + box.min.y);
                console.log("---> + height: " + box.max.y);

                if(box.min.y < 0){
                    mesh.position.set( 0, -(box.min.y), 0 );
                } else if(box.min.y > 0){
                    mesh.position.set( 0, -(box.min.y), 0 );
                } else {
                    mesh.position.set( 0, 0, 0 );
                }

                console.log("------ ");
                console.log("---> pos: " + mesh.position.y);

                var box = new THREE.Box3().setFromObject( mesh );

                var helper = new THREE.Box3Helper( box, 0xffff00 );
                //scene.add( helper );
                //console.log(helper.position);

    			scene.add( mesh ); ObjectControl1.attach( mesh );

    			if ( mesh instanceof THREE.Mesh ) {
                   mesh_pos = mesh; // set value to the global variable, applicable, if the objMesh has one child of THREE.Mesh()
            	}

                selected_object_obj = mesh_pos;

        } );

    }


    // --------- DRAG AND DROP FILE ----------- //

    var dropZone = document.getElementById('drag-file');

    function showDropZone() {
        dropZone.style.visibility = "visible";
    }
    function hideDropZone() {
        dropZone.style.visibility = "hidden";
    }

    function allowDrag(e) {
        if (true) {  // Test that the item being dragged is a valid one
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        hideDropZone();

        //alert('Drop!');
    }

    // 1
    window.addEventListener('dragenter', function(e) {
        showDropZone();
    });

    // 2
    dropZone.addEventListener('dragenter', allowDrag);
    dropZone.addEventListener('dragover', allowDrag);

    // 3
    dropZone.addEventListener('dragleave', function(e) {
        hideDropZone();
    });

    // 4
    dropZone.addEventListener('drop', handleDrop);


    (function () {
        var holder = document.getElementById('drag-file');

        holder.ondragover = () => {
            return false;
        };

        holder.ondragleave = () => {
            return false;
        };

        holder.ondragend = () => {
            return false;
        };

        holder.ondrop = (e) => {
            e.preventDefault();

            for (let f of e.dataTransfer.files) {
                console.log('File(s) you dragged here: ', f.path);
                //$('#fileUpload').val(f.path);

                var ext = f.name.slice((f.name.lastIndexOf(".") - 1 >>> 0) + 2);
                if(ext == "stl"){
                    console.log("ext --> ." + ext + " -> OK");
                    load_stl_model(f.path, f.name);
                } /*
                else if(ext == "obj"){              // EXPERIMENTAL --> disabled
                    console.log("ext --> ." + ext + " -> OK");
                    load_obj_model(f.path, f.name);
                } */

                else {
                    console.log("ERROR --> Unsupported File --> ." + ext);
                    alert("Unsupported File --> ." + ext + "  (only .stl)");
                }

            }

            return false;
        };
    })();

    // --------- END OF DRAG AND DROP ----------- //

    //show_gcode();
    //show_gcode_ui();

    $(document).on('click','#show_gcode', function(){       // ---------->> load gcode <<------
        show_gcode();
    });

    function show_gcode(){       // ---------->> load and show gcode <<------

        console.log("load_gcode_view");

        $(".gcode_view_info_msg").text("analyzing gcode ...");

        var gcode_view = scene.getObjectByName( "gcode_view", true );
        if(gcode_view == null){
            console.log("no old gcode view");
        } else {
            scene.remove( gcode_view );
            animate();
        }

        //effectController.minlayer
        //global_var_gcode_end = effectController.maxlayer;

        var loader = new THREE.GCodeLoader();
    	loader.load( 'output/output.gcode', function ( gcode_view_mesh ) {

    		gcode_view_mesh.position.set( -100, 0, 100 );
            gcode_view_mesh.name = "gcode_view";
    		scene.add( gcode_view_mesh );

            if ( gcode_view_mesh instanceof THREE.Mesh ) {
               gcode_view = gcode_view_mesh; // set value to the global variable, applicable, if the objMesh has one child of THREE.Mesh()
        	}

    	} );

        ipc.send("open_window_analyzer", "open");

    }

    function re_show_gcode(){       // ---------->> reload and show new gcode with max layer <<------

        /*
var gcode_view = scene.getObjectByName( "gcode_view", true );
        scene.remove( gcode_view );
        animate();*/

        var gcode_view = scene.getObjectByName( "gcode_view", true );
        if(gcode_view == null){
            console.log("no old gcode view");
        } else {
            scene.remove( gcode_view );
            animate();
        }

        console.log(">> gcode removed");

        var loader = new THREE.GCodeLoader();
    	loader.load( 'output/output.gcode', function ( gcode_view_mesh ) {

    		gcode_view_mesh.position.set( -100, 0, 100 );
            gcode_view_mesh.name = "gcode_view";
    		scene.add( gcode_view_mesh );

            if ( gcode_view_mesh instanceof THREE.Mesh ) {
               gcode_view = gcode_view_mesh; // set value to the global variable, applicable, if the objMesh has one child of THREE.Mesh()
        	}

    	} );

        console.log(">> gcode added");

    }

    var feedback_slicer;
    function show_gcode_ui(){
        $("#stl_ui_side_bar").fadeOut("slow");
        setTimeout(function(){
            $("#gcode_ui_side_bar").fadeIn("slow");
        }, 200);

        var feedback_slicer_array = feedback_slicer.split(" ");
        var fil_required = "";

        for(var i = 0; i < feedback_slicer_array.length; i++){
            if(feedback_slicer_array[i] == "required:"){
                console.log(feedback_slicer_array[i + 1]);

                var string = feedback_slicer_array[i + 1];
                if(string.indexOf("mm") !=-1){
                    fil_required = string;
                    console.log("got fil_required <<<");
                }
            }
        }

        console.log("Filament required: " + fil_required);
        $(".fil_required").text("filament required: " + fil_required);

        $(".slider_value_gc").text($("#gcode_slider .ui-slider-tip").html() * 5 + "%");
        $("#gcode_slider").on("mouseup", function () {

            console.log(">> reload view");
            global_var_gcode_end = 5 * $("#gcode_slider .ui-slider-tip").html();
            $(".slider_value_gc").text($("#gcode_slider .ui-slider-tip").html() * 5 + "%");

            re_show_gcode();

        });

    }

    $(document).on('click', '#back_to_models', function(){

        var gcode_view = scene.getObjectByName( "gcode_view", true );
        //gcode_view.visible = false;
        scene.remove( gcode_view ); // remove gcode view from scene
        animate();

        var object = scene.getObjectByName(loaded_models.model[0].name);

        setTimeout(function(){
            for(var i = 0; i < loaded_models.model.length; i++){    // get name from object array to hide them
                var object = scene.getObjectByName( loaded_models.model[i].name, true );
                object.visible = true;
            }
        }, 100);

        $("#slice_btn").show();
        $("#back_to_models").hide();

        $("#gcode_ui_side_bar").fadeOut("slow");
        setTimeout(function(){
            $("#stl_ui_side_bar").fadeIn("slow");
        }, 200);

    });

    ipcRenderer.on('slice_fc_menu', function () {
        slice_model();
    });

    function slice_model(){

        // load preset << user settings

        for(var i = 0; i < loaded_models.model.length; i++){    // get name from object array to hide them
            var object = scene.getObjectByName( loaded_models.model[i].name, true );
            object.visible = false;
        }

        setTimeout(function(){
            var gcode_view = scene.getObjectByName( "gcode_view", true );
            gcode_view.visible = true;
        }, 1000);

        if($("#model_li").length !== 0){    // check if models exist
            console.log(">> start slicing");

            function show_div_load_slice(){    // Animated loading / slicing screen
            	$(".loading_screen_slice").show();
                function show_div_load_slice(){
                	$(".loading_screen_slice").addClass("show");
                	$(".loading_screen_slice").removeClass("hide");
                }
                setTimeout(show_div_load_slice, 500);
            }
            setTimeout(show_div_load_slice, 100);

            exportASCII();  // export stl with right rotation

            var path_to_file = "output/output.stl"; // get prepared stl file

            var single_obj_pos = "";

            if(loaded_models.model.length == 1){
                var slingle_obj = scene.getObjectByName( loaded_models.model[0].name, true );
                single_obj_pos = "-m --print-center " + (space_y - Math.abs(slingle_obj.position.x - space_y / 2)) + "," + Math.abs(slingle_obj.position.z - space_x / 2);
                console.log(single_obj_pos);
            } else {
                single_obj_pos = "";
            }

            $("#slice_btn").hide();
            $("#back_to_models").show();

            setTimeout(function(){    // send comand to slicer core
                if(os.platform() == "darwin"){  // os.type Darwin >> mac os
                    cmd.get(
                        //'perl slicer_core/mac/slic3r.pl -o output/output.gcode output/output.stl ',
                        'slicer_core/mac/Slic3r.app/Contents/MacOS/slic3r --load app_settings/last_config.ini ' + single_obj_pos + ' -o output/output.gcode output/output.stl',
                        function(err, data, stderr){
                            console.log(data);  // get feedback from slicer core
                            feedback_slicer = data;
                            if (data !== null) {
                              console.log(">> Done");       // script if sucess
                              show_gcode_ui();
                              //alert("Done!");
                              setTimeout(function(){
                                  show_gcode();
                                  $("#slice_btn").hide();
                                  $("#back_to_models").show();

                                  function show_div_load_slice(){
                                  	$(".loading_screen_slice").addClass("hide");
                                    $(".loading_screen_slice").removeClass("show");
                                      function show_div_load_slice(){
                                      	$(".loading_screen_slice").hide();
                                      }
                                      setTimeout(show_div_load_slice, 600);
                                  }
                                  setTimeout(show_div_load_slice, 200);

                              }, 500);
                            }
                        }
                    );
                } else if(os.platform() == "win32"){    // windows slicer core
                    cmd.get(
                        basepath + '/slicer_core/win/Slic3r-console.exe --load app_settings/last_config.ini ' + single_obj_pos + ' -o output/output.gcode output/output.stl',
                        function(err, data, stderr){
                            console.log(data);  // get feedback from slicer core
                            feedback_slicer = data;
                            if (data !== null) {
                              console.log(">> Done");       // script if sucess
                              show_gcode_ui();
                              //alert("Done!");
                              setTimeout(function(){
                                  show_gcode();
                                  $("#slice_btn").hide();
                                  $("#back_to_models").show();

                                  function show_div_load_slice(){
                                  	$(".loading_screen_slice").addClass("hide");
                                    $(".loading_screen_slice").removeClass("show");
                                      function show_div_load_slice(){
                                      	$(".loading_screen_slice").hide();
                                      }
                                      setTimeout(show_div_load_slice, 600);
                                  }
                                  setTimeout(show_div_load_slice, 200);

                              }, 500);
                            }
                        }
                    );
                } else if(os.platform() == "linux"){    // linux slicer core
                    console.warn(">> Linux slicer core is not finished");
                    cmd.get(
                        'slicer_core/linux/Slic3r/Slic3r --load app_settings/last_config.ini ' + single_obj_pos + ' -o output/output.gcode output/output.stl',
                        function(err, data, stderr){
                            console.log(data);  // get feedback from slicer core
                            feedback_slicer = data;
                            if (data !== null) {
                              console.log(">> Done");       // script if sucess
                              show_gcode_ui();
                              //alert("Done!");
                              setTimeout(function(){
                                  show_gcode();
                                  $("#slice_btn").hide();
                                  $("#back_to_models").show();

                                  function show_div_load_slice(){
                                  	$(".loading_screen_slice").addClass("hide");
                                    $(".loading_screen_slice").removeClass("show");
                                      function show_div_load_slice(){
                                      	$(".loading_screen_slice").hide();
                                      }
                                      setTimeout(show_div_load_slice, 600);
                                  }
                                  setTimeout(show_div_load_slice, 200);

                              }, 500);
                            }
                        }
                    );
                } else {
                    console.warn(">> error: unknown platform");
                }
            }, 1000);

            console.log(">> working ...");
        } else {
            console.log(">> no models");
        }
    }

    $(".loading_screen_slice").hide();

    $(document).on('click','#slice_btn', function(){
        slice_model();
    });

    function exportASCII() {    // export stl with right rotation

        console.log("object.model --> export ");

        for(var i = 0; i < loaded_models.model.length; i++){    // get name from object array to hide them
            var object = scene.getObjectByName( loaded_models.model[i].name, true );
            object.visible = false;
        }

        var group = new THREE.Group();      // create group from objects for export
        for(var i = 0; i < loaded_models.model.length; i++){
            var addObject = scene.getObjectByName(loaded_models.model[i].name);

            selected_object_obj = scene.getObjectByName(loaded_models.model[i].name);
            selected_object = loaded_models.model[i].name;
            $("#rot_x").val($("#rot_x").val() + 90);        // set rotaion dimestions for slicer_core
            rotation_set();

            var cloneObject = addObject.clone();            // group delete original --> clone object same name
            cloneObject.name = loaded_models.model[i].name;
            scene.add(cloneObject); ObjectControl1.attach( cloneObject );
                                                            // set rotation and position for cloned object
            cloneObject.rotation.set((cloneObject.rotation.x - (Math.PI / 2)), cloneObject.rotation.y, cloneObject.rotation.z);
            cloneObject.position.set(addObject.position.x, addObject.position.y, addObject.position.z);

            group.add( addObject );
        }

        setTimeout(function(){      // export objects to one stl output
            var result = exporter.parse( group );
            saveString( result, 'output/output.stl' );
        }, 200);

    }

    function saveString( text, filename ) {

        var data = text;
        fs.writeFile(filename, data, (err) => {
            if (err) throw err;
            //console.log('The file has been saved!');
        });
	}


	ObjectControl5 = new ObjectControls( camera, renderer.domElement );
	ObjectControl5.displacing = false; ObjectControl5.attach( checkerboard );

	ObjectControl5.mouseover = function () {
		control.enabled = true;		///------>> zoom pad disable

		ObjectControl1.onclick = function() {

			//console.log("mouse_click --> drag");
			control.enabled = false;

			//mesh_pos.material.color.setHex( 0x008EB4 );    // issue with .obj

			ObjectControl1.mouseup = function() {
				control.enabled = true;

                selected_object = this.focused.name;
                selected_object_obj = this.focused;
                console.log( "selected: " + selected_object );

                //this.focused.material.color.setHex( 0x00BAFF );   // issue with .obj

                //delete_obj(this.focused.name);

				var mesh_move_x = 100 + selected_object_obj.position.x;
				var mesh_move_y = 100 + selected_object_obj.position.z;
				console.log("x: " + mesh_move_x);
				console.log("y: " + mesh_move_y);
				//console.log(mesh_pos.position);

			}
		}
	}

    $("#rot_x").val(0);
    $("#rot_y").val(0);
    $("#rot_z").val(0);

function rotation_set(){     // --> set rotation of model

    var rot_x = $('#rot_x').val();
    var rot_y = $("#rot_y").val();
    var rot_z = $("#rot_z").val();

    //console.log("rot_x_y_z: " + rot_x +"-"+ rot_y +"-"+ rot_z);

    selected_object_obj.rotation.x = (270 + parseInt(rot_x)) * (Math.PI / 180);
    selected_object_obj.rotation.y = rot_y * (Math.PI / 180);
    selected_object_obj.rotation.z = rot_z * (Math.PI / 180);

    var selectedObject = scene.getObjectByName(selected_object);
    var box = new THREE.Box3().setFromObject( selectedObject );

    if(box.min.y < 0){
        selectedObject.position.y = -(box.min.y);
    } else if(box.min.y > 0){
        selectedObject.position.y = -(box.min.y);
    } else {
        console.log("z = 0");
    }

    var helper = new THREE.Box3Helper( box, 0xffff00 );

    $("#rot_x").val(Math.abs(Math.round(selected_object_obj.rotation.x / (Math.PI / 180)) - 270));  // cant set 30.5 !! Math.round()  //  x -> 270 axis compensate
    //$("#rot_x").val(Math.round(selected_object_obj.rotation.x / (Math.PI / 180)));
    $("#rot_y").val(Math.round(selected_object_obj.rotation.y / (Math.PI / 180)));
    $("#rot_z").val(Math.round(selected_object_obj.rotation.z / (Math.PI / 180)));

    var box = new THREE.Box3().setFromObject( selectedObject );

    var helper = new THREE.Box3Helper( box, 0xffff00 );
    //scene.add( helper );

    set_floor(selected_object);
    $(".rotation_menu_manual").removeClass("active");
}

$("#scale_x").val(100);
$("#scale_y").val(100);
$("#scale_z").val(100);
$("#scale_unify").val(100);

function scale_set(){     // --> set scale of model

    var unify;

    $("#unify_scale").hasClass("unify_scale") ? unify = 1 : unify = 0;

    if(unify == 1){
        console.log("unify");

        var scale_x = $('#scale_unify').val();
        var scale_y = $("#scale_unify").val();
        var scale_z = $("#scale_unify").val();
    } else {
        console.log("no-unify");

        var scale_x = $('#scale_x').val();
        var scale_y = $("#scale_y").val();
        var scale_z = $("#scale_z").val();
    }

    console.log("scale_x_y_z: " + scale_x +"-"+ scale_y +"-"+ scale_z);

    selected_object_obj.scale.x = scale_x / 100;
    selected_object_obj.scale.y = scale_y / 100;
    selected_object_obj.scale.z = scale_z / 100;

    var selectedObject = scene.getObjectByName(selected_object);
    var box = new THREE.Box3().setFromObject( selectedObject );

    if(box.min.y < 0){
        selectedObject.position.y = -(box.min.y);
    } else if(box.min.y > 0){
        selectedObject.position.y = -(box.min.y);
    } else {
        console.log("z = 0");
    }

    var helper = new THREE.Box3Helper( box, 0xffff00 );

    $("#scale_x").val(selected_object_obj.scale.x * 100);
    $("#scale_y").val(selected_object_obj.scale.y * 100);
    $("#scale_z").val(selected_object_obj.scale.z * 100);
    $("#scale_unify").val(selected_object_obj.scale.x * 100);

    var box = new THREE.Box3().setFromObject( selectedObject );

    var helper = new THREE.Box3Helper( box, 0xffff00 );
    //scene.add( helper );

    set_floor(selected_object);
    $(".scale_menu_manual").removeClass("active");
}

    $(document).on('click','#set_rotation', function(){     // --> set rotation of model
        rotation_set();
    })

    $('.rotation_inp').keyup(function(e){if(e.keyCode == 13)        // --> set rotation of model enter
        rotation_set();
    })

    $(document).on('click','#rotate_object_y', function(){     // --> set rotation of model
        var rotaion_deg = Math.round(selected_object_obj.rotation.y / (Math.PI / 180)) + 90;
        rotaion_deg > 360 ? rotaion_deg = 0 : console.log(" y +90 deg");
        $("#rot_y").val(rotaion_deg);
        rotation_set();
    })

    $(document).on('click','#rotate_object_x', function(){     // --> set rotation of model     //ERROR: ----> Not Wokr +90 deg!!
        //var rotaion_deg = Math.round((Math.abs(selected_object_obj.rotation.x - 270))/ (Math.PI / 180)) + 90;
        var rotaion_deg = Math.round(Math.abs(selected_object_obj.rotation.x - (Math.PI * 1.5)) / (Math.PI / 180)) + 90;
        //var rotaion_deg = Math.round(selected_object_obj.rotation.x / (Math.PI / 180)) + 90;
        rotaion_deg > 360 ? rotaion_deg = 0 : console.log("x +90 deg");
        $("#rot_x").val(rotaion_deg);
        rotation_set();
    })

    $(document).on('click','#rotate_object_z', function(){     // --> set rotation of model
        var rotaion_deg = Math.round(selected_object_obj.rotation.z / (Math.PI / 180)) + 90;
        rotaion_deg > 360 ? rotaion_deg = 0 : console.log("z +90 deg");
        $("#rot_z").val(rotaion_deg);
        rotation_set();
    })

    $(document).on('click','#delete_object', function(){
        delete_obj(selected_object);
    })

    $(document).on('click','.del_model_btn', function(){
        var object_to_delete = $(this).attr("id");
        delete_obj(object_to_delete);
    })

    $(document).on('click','#set_scale', function(){     // --> set scale of model
        scale_set();
    })

    $('.scale_inp').keyup(function(e){if(e.keyCode == 13)        // --> set scale of model enter
        scale_set();
    })

    $('html').keyup(function(e){if(e.keyCode == 46)
        delete_obj(selected_object);
    })

    $(document).on('click','#set_floor', function(){
        set_floor_00(selected_object);
    })

    $(document).on('click','#exp_stl', function(){      // exp stl ----> debug
        exportASCII();
    })

	ObjectControl5.mouseout = function () {
		control.enabled = true;
	}

}

// ----- end of three js ini() ------

function delete_obj(objName){
  var selectedObject = scene.getObjectByName(objName);
  scene.remove( selectedObject );

  $('#model_list_div li:contains("' + objName + '")').remove();


  var index_item = loaded_models.model.findIndex(x => x.name == objName);
  //console.log(index);
  loaded_models.model.splice(index_item, 1);

  console.log("object deleted");
  console.log(loaded_models);

  animate();
}

function set_floor_00(objName){
  var selectedObject = scene.getObjectByName(objName);

  selectedObject.position.set( 0, 0, 0 );

  var box = new THREE.Box3().setFromObject( selectedObject );

  if(box.min.y < 0){
      selectedObject.position.set( 0, -(box.min.y), 0 );
  } else if(box.min.y > 0){
      selectedObject.position.set( 0, -(box.min.y), 0 );
  } else {
      selectedObject.position.set( 0, 0, 0 );
  }

  var box = new THREE.Box3().setFromObject( selectedObject );

  var helper = new THREE.Box3Helper( box, 0xffff00 );
  //scene.add( helper );

  //console.log(helper.position);

  animate();

}

function set_floor(objName){
  var selectedObject = scene.getObjectByName(objName);

  var box = new THREE.Box3().setFromObject( selectedObject );

  if(box.min.y < 0){
      selectedObject.position.y = -(box.min.y);
  } else if(box.min.y > 0){
      selectedObject.position.y = -(box.min.y);
  } else {
      console.log("z = 0");
  }

  var box = new THREE.Box3().setFromObject( selectedObject );

  var helper = new THREE.Box3Helper( box, 0xffff00 );
  //scene.add( helper );

  //console.log(helper.position);

  animate();

}

function animate() {

	requestAnimationFrame(animate);
	render();

}

function render() {

	ObjectControl1.update();
	ObjectControl2.update();
	//ObjectControl3.update();
	//ObjectControl4.update();
	ObjectControl5.update();

	control.update();
	renderer.render(scene, camera);

}

var hover_over_element = "";

function clone_object(objname){

    var get_obj_clone = scene.getObjectByName(objname);
    var cloneObject = get_obj_clone.clone();
    var new_file_name = "(cp)" + objname
    cloneObject.name = new_file_name;

    var box = new THREE.Box3().setFromObject( get_obj_clone );

    //console.log(Math.abs(box.max.x - box.min.x));
    //console.log(Math.abs(box.max.z - box.min.z));

    cloneObject.position.x = get_obj_clone.position.x + (Math.abs(box.max.x - box.min.x) / 2) + 10;
    cloneObject.position.z = get_obj_clone.position.z + (Math.abs(box.max.z - box.min.z) / 2) + 10;

    var model_obj = loaded_models.model.find(x => x.name == objname);   // get obj path
    var clone_path = model_obj.path;

    loaded_models.model.push({ name: new_file_name, path: clone_path });

    $("#model_list_div").append("<li id='model_li' class='model_menu_li'><p id='model_li_p'>" + new_file_name + "</p><div class='cross_icon del_model_btn' id='" + new_file_name + "'></div></li>");

    console.log("clone object path: " + model_obj.path);
    console.log(loaded_models.model);

    scene.add(cloneObject); ObjectControl1.attach(cloneObject);

}

// --------- END OF THREE.JS ----------- //


$(document).on('click','#rotate_object', function(){
    $(".rotation_menu").toggleClass("active");
})

$(document).on('click','#rotate_object_manual', function(){
    $(".rotation_menu_manual").toggleClass("active");
    $(".rotation_menu").toggleClass("active");
})

$(document).on('click','#scale_object', function(){
    $(".scale_menu_manual").toggleClass("active");
})

$(document).on('click','#model_li_p', function(){
    selected_object = $(this).text();
})

$(".no_unify_scale_div").hide();

$(document).on('click','#unify_scale', function(){
    $(this).toggleClass("unify_scale");
    $(this).toggleClass("no_unify_scale");
    if($("#unify_scale").hasClass("unify_scale")){
        $(".unify_scale_div").show();
        $(".no_unify_scale_div").hide();
    } else {
        $(".unify_scale_div").hide();
        $(".no_unify_scale_div").show();
    }
})

var shell = require('shelljs');
shell.ls('*.js');

const exec = require('child_process').exec;

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => {
        callback(stdout);
    });
};

if(os.platform() == "darwin"){
    console.log("platform: mac os");
    //execute('perl slicer_core/mac/slic3r.pl --version', (output) => {
    execute('slicer_core/mac/Slic3r.app/Contents/MacOS/slic3r --version', (output) => {
        console.log("slicer_core respond test --> v:" + output);
        if(output == ""){
            alert("slicer_core --> is not responding");
            console.error("ERROR: slicer_core --> is not responding");
            console.log("check folder slicer_core if is correctly installed.");
            console.log("check perl instalation");
            console.log("Slicing will not work!");
            console.log("----------------------");
        }
    });
} else if(os.platform() == "win32"){
    console.log("platform: windows");
    console.log(basepath);
    cmd.get(
        basepath + '/slicer_core/win/Slic3r-console.exe --version',
        function(err, data, stderr){
            console.log(data);  // get feedback from slicer core
            if (data !== null) {
              console.log(">> Done");       // script if sucess
              //alert("Done!");
          } else {
              alert("slicer_core --> is not responding");
              console.error("ERROR: slicer_core --> is not responding");
              console.log("check folder slicer_core if is correctly installed.");
              console.log("check perl instalation");
              console.log("Slicing will not work!");
              console.log("----------------------");
          }
        }
    );
} else if (os.platform() == "linux"){
    console.log("platform: Linux");
    execute('slicer_core/linux/Slic3r/Slic3r --version', (output) => {
        console.log("slicer_core respond test --> v:" + output);
        if(output == ""){
            alert("slicer_core --> is not responding");
            console.error("ERROR: slicer_core --> is not responding");
            console.log("check folder slicer_core if is correctly installed.");
            console.log("check perl instalation");
            console.log("Slicing will not work!");
            console.log("----------------------");
        }
    });
} else {
    console.warn(">> core-error: unknown platform" + os.type() + "-" + os.platform());
}

jQuery(document).ready(function($) {

    $(document).ready(function(){
        function hide_div_load(){
        	$(".loading_screen").addClass("hide");
            function hide_div_load(){
            	$(".loading_screen").hide();
            }
            setTimeout(hide_div_load, 600);
        }
        setTimeout(hide_div_load, 600);
    })

});

// context menu

var item_selected_ctx = "";

const menu_1 = new Menu()
menu_1.append(new MenuItem({ label: 'MenuItem1', click() { console.log('item 1 clicked') } }))
menu_1.append(new MenuItem({ type: 'separator' }))
menu_1.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }))

const model_li_menu = new Menu()
model_li_menu.append(new MenuItem({ label: 'duplicate', click() {
    console.log('clone obj');
    clone_object(item_selected_ctx);
} }))
model_li_menu.append(new MenuItem({ label: 'remove', click() {
    delete_obj(item_selected_ctx);
    alert(item_selected_ctx);
    console.log('removed');
} }))

const help_info_menu = new Menu()
help_info_menu.append(new MenuItem({ label: 'info', click() {
    help_info_show(hover_over_element_text);
} }))

var app_config = ini.parse(fs.readFileSync("app_settings/app_config.ini", 'utf-8'))
if(app_config.show_help == 1){
    setTimeout(function(){
        $(document).on('click','#help_info', function(){
            var hover_over_element_text_intern = $(this).attr("data");
            if($(".info_help_text").text() == ""){
                help_info_show(hover_over_element_text_intern);
            } else {
                hide_help_screen();
            }
        });
    }, 800);
}

window.addEventListener('contextmenu', (e) => {

    item_selected_ctx = $(e.target).text();
    hover_over_element = $(e.target).attr('id');
    var hover_over_element_text_intern = $(e.target).attr("data");

    if(hover_over_element == "side_bar"){
        //menu_1.popup({ window: remote.getCurrentWindow() })
    } else if(hover_over_element == "canvas"){
        //nothing
    } else if(hover_over_element == "model_li_p"){
        model_li_menu.popup({ window: remote.getCurrentWindow() })
        hover_over_element = "";
    } else if(hover_over_element == "help_info"){   // help info menu
        hover_over_element_text = hover_over_element_text_intern;
        help_info_menu.popup({ window: remote.getCurrentWindow() })
        hover_over_element = "";
    } else {
        //menu_1.popup({ window: remote.getCurrentWindow() })
    }

    console.log("hover: ", hover_over_element);
    console.log("text: ", hover_over_element_text);

    //console.log(hover_over_element);
    e.preventDefault()

}, false)


$("canvas").hover(function() {      // no right click on canvas 3D view
    hover_over_element = "canvas";
}, function() {
    hover_over_element = "";
});

function help_info_show(element_text){
    load_help_screen();
    setTimeout(function(){

        if(element_text == "print_quality"){
            $(".info_headline").text("print quality");
            $(".info_help_text").text("Print quality depends on print layer height and print speed. Lower the layer height, better will be details.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_1.jpg");
        } else if(element_text == "infill_density"){
            $(".info_headline").text("infill density");
            $(".info_help_text").text("Infill density is how many plastic will be used for printing part.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_2.jpg");
        } else if(element_text == "generate_supports"){
            $(".info_headline").text("generate supports");
            $(".info_help_text").text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_3.png");
        } else if(element_text == "layer_fan"){
            $(".info_headline").text("layer fan");
            $(".info_help_text").text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_4.jpg");
        } else if(element_text == "head_temperature"){
            $(".info_headline").text("nozzle temperature");
            $(".info_help_text").text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_4.jpg");
        } else if(element_text == "bed_temperature"){
            $(".info_headline").text("bed temperature");
            $(".info_help_text").text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_4.jpg");
        } else if(element_text == "retration"){
            $(".info_headline").text("retration");
            $(".info_help_text").text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_4.jpg");
        } else if(element_text == "brim"){
            $(".info_headline").text("brim");
            $(".info_help_text").text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_4.jpg");
        } else if(element_text == "raft"){
            $(".info_headline").text("raft");
            $(".info_help_text").text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_4.jpg");
        } else if(element_text == "extrude_multipler"){
            $(".info_headline").text("extrude multipler");
            $(".info_help_text").text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_4.jpg");
        } else if(element_text == "infill"){
            $(".info_headline").text("infill");
            $(".info_help_text").text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.");
            $(".info_help_img").prop("src", "assets/img/info_img/img_4.jpg");
        }

        $(document).on('click','#close_info_help', function(){
            hide_help_screen();
        })

    }, 100);
}

$("#quality_slider")       // define slider
    .slider({
        max: 8,
        min: 0,
        //range: "min",
        value: 5,
        orientation: "horizontal"
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

$("#infill_slider")       // define slider
    .slider({
        max: 10,
        min: 0,
        //range: "min",
        value: 6,
        orientation: "horizontal"
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

$("#speed_slider")       // define slider
    .slider({
        max: 11,
        min: 0,
        //range: "min",
        value: 5,
        orientation: "horizontal"
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

$("#temp_end_slider")       // define slider
    .slider({
        max: 14,
        min: 0,
        //range: "min",
        value: 4,
        orientation: "horizontal"
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

$("#temp_bed_slider")       // define slider
    .slider({
        max: 14,
        min: 0,
        //range: "min",
        value: 4,
        orientation: "horizontal"
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

$("#ext_mpt_slider")       // define slider
    .slider({
        max: 10,
        min: 0,
        //range: "min",
        value: 5,
        orientation: "horizontal"
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

$("#gcode_slider")       // define slider
    .slider({
        max: 20,
        min: 0,
        //range: "min",
        value: 20,
        orientation: "horizontal"
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");


var ext_mpt_array = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
var speed_array = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 80];
var temp_end_array = [170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240];
var temp_bed_array = [0, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110];
var layers_array = [0.1, 0.125, 0.15, 0.175, 0.2, 0.225, 0.25, 0.275, 0.3];
sliders_velue_set();

var settings_files = [];
var settings_file_names = [];
const directoryPath = path.join(__dirname, 'user_settings');
fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    files.forEach(function (file) {
        var string_array = file.split("_");
        if(string_array.length == 2){
            if(string_array[0] == "preset" || string_array[0] == "user#preset"){
                var name = string_array[1];
                name = name.split(".")
                if(name.length !== 2){
                    console.warn("incorrect settings file name");
                }  else {
                    settings_files.push(name[0]);
                    settings_file_names.push(file);
                }
            }
        } else {
            console.warn("incorrect settings file name");
        }
    });
});

setTimeout(function(){
    load_preset_files();
}, 200);

function load_preset_files(){
    for(var i = 0; i < settings_files.length; i++){
        var preset_name = settings_files[i].replace("-", " ");
        $(".preset_select select").append("<option value=" + preset_name + ">" + preset_name + "</option>");
    }
    console.log("loaded presets:");
    console.log(settings_files);
    console.log(settings_file_names);
}

$(document).on('click','.switch_set', function(){
    setTimeout(function(){

        if($(".sw_brim .btn-toggle").hasClass("active")){
            $(".sw_raft .btn-toggle").removeClass("active");
        }

        if($(".sw_raft .btn-toggle").hasClass("active")){
            $(".sw_brim .btn-toggle").removeClass("active");
        }

        save_config();
    }, 200);

})

$(document).on('click','.sw_brim', function(){
    if($(".sw_brim .btn-toggle").hasClass("active")){
        $(".sw_raft .btn-toggle").removeClass("active");
    }
})

$(document).on('click','.sw_raft', function(){
    if($(".sw_raft .btn-toggle").hasClass("active")){
        $(".sw_brim .btn-toggle").removeClass("active");
    }
})

$(document).on('click','.sw_retraction', function(){

    var config = ini.parse(fs.readFileSync("app_settings/app_config.ini", 'utf-8'))
    var retraction_enable = config.retract_length;

    setTimeout(function(){
        if(!$(".sw_retraction .btn-toggle").hasClass("active")){
            config.retract_length = $(".inp_retraction").val();
            $(".inp_retraction").prop( "disabled", true );
            $(".inp_retraction").val(0);
        } else {
            $(".inp_retraction").prop( "disabled", false );
            $(".inp_retraction").val(retraction_enable);
        }

        fs.writeFileSync('./app_settings/app_config.ini', ini.stringify(config))

    }, 200);
})

$(document).on('change','.inp_retraction', function(){
    setTimeout(function(){
        save_config();
    }, 200);
})

//  ----- select dialog -----
setTimeout(function(){

    load_select_dialog();
    load_preset();

}, 600);

function load_select_dialog(){
    $('select').each(function(){
        var $this = $(this), numberOfOptions = $(this).children('option').length;

        $this.addClass('select-hidden');
        $this.wrap('<div class="select"></div>');
        $this.after('<div class="select-styled"></div>');

        var $styledSelect = $this.next('div.select-styled');
        $styledSelect.text($this.children('option').eq(0).text());

        var $list = $('<ul />', {
            'class': 'select-options'
        }).insertAfter($styledSelect);

        for (var i = 0; i < numberOfOptions; i++) {
            $('<li />', {
                text: $this.children('option').eq(i).text(),
                rel: $this.children('option').eq(i).val()
            }).appendTo($list);
        }

        var $listItems = $list.children('li');

        $styledSelect.click(function(e) {
            e.stopPropagation();
            $('div.select-styled.active').not(this).each(function(){
                $(this).removeClass('active').next('ul.select-options').hide();
            });
            $(this).toggleClass('active').next('ul.select-options').toggle();
        });

        $listItems.click(function(e) {
            e.stopPropagation();
            $styledSelect.text($(this).text()).removeClass('active');
            $this.val($(this).attr('rel'));
            $list.hide();

            if($this.parent().parent().attr('class') == "preset_select"){
                console.log("select: " + $(".select-styled").html());
                load_preset($(".select-styled").html());

                save_last_preset_name();
            }

            save_config();
        });

        $(document).click(function() {
            $styledSelect.removeClass('active');
            $list.hide();
        });

        console.log(">> load preset select");

    });
}

// ---- select dialog end ------

function load_preset(pres_name){

    console.log("------ load_preset -------");

    if(pres_name == null){
        selected_preset_name = "app_settings/last_config.ini";
    } else {
        var selected_preset = pres_name;
        selected_preset = selected_preset.replace(" ", "-");
        var index = settings_files.indexOf(selected_preset);
        var selected_preset_name = settings_file_names[index];

        selected_preset_name = "./user_settings/" + selected_preset_name;
    }

    var config = ini.parse(fs.readFileSync(selected_preset_name, 'utf-8'))

    var layer_height = config.layer_height;
    var infill_density = config.fill_density;
    var print_speed = config.max_print_speed;
    var end_temperature = config.temperature;
    var bed_temperature = config.bed_temperature;
    var infill_pattern = config.fill_pattern;
    var support_enable = config.support_material;
    var retraction_enable = config.retract_length;
    var layer_fan_enable = config.cooling;
    var brim_enable = config.brim_width;
    var raft_enable = config.raft_layers;
    var layer_height_index = layers_array.indexOf(Number(config.layer_height));
    var print_speed_index = speed_array.indexOf(Number(config.max_print_speed));
    var end_temperature_index = temp_end_array.indexOf(Number(config.temperature));
    var bed_temperature_index = temp_bed_array.indexOf(Number(config.bed_temperature));
    var ext_mpt_index = ext_mpt_array.indexOf(Number(config.extrusion_multiplier * 100));
    var infill_density_slider = infill_density.replace("%","");
    infill_density_slider = Number(infill_density_slider) / 10;

    $(".label_preset_material").text(config.material_type);

    $(".infill_type .select-styled").html("Rectilinear");
    if(infill_pattern == "honeycomb"){
        $(".infill_type .select-styled").html("Honeycomb");
    } else if(infill_pattern == "rectilinear"){
        $(".infill_type .select-styled").html("Rectilinear");
    } else if(infill_pattern == "3dhoneycomb"){
        $(".infill_type .select-styled").html("3D Honeycomb");
    } else {
        $(".infill_type .select-styled").html("Honeycomb");
        console.log("infil type not found >> default")
    }

    if(support_enable == 0){
        $(".sw_support .btn-toggle").removeClass("active");
        $(".sw_support .btn-toggle").removeClass("focus");
        $(".sw_support .btn-toggle").attr("pressed","false");
    } else {

        if(!$(".sw_support .btn-toggle").hasClass("active")){
            $(".sw_support .btn-toggle").addClass("active");
            $(".sw_support .btn-toggle").addClass("focus");
        }
        $(".sw_support .btn-toggle").attr("pressed","true")
    }

    if(layer_fan_enable == 0){
        $(".sw_layer_fan .btn-toggle").removeClass("active");
        $(".sw_layer_fan .btn-toggle").removeClass("focus");
        $(".sw_layer_fan .btn-toggle").attr("pressed","false");

    } else {

        if(!$(".sw_layer_fan .btn-toggle").hasClass("active")){
            $(".sw_layer_fan .btn-toggle").addClass("active");
            $(".sw_layer_fan .btn-toggle").addClass("focus");
        }
        $(".sw_layer_fan .btn-toggle").attr("pressed","true");

    }

    if(brim_enable == 0){
        $(".sw_brim .btn-toggle").removeClass("active");
        $(".sw_brim .btn-toggle").removeClass("focus");
        $(".sw_brim .btn-toggle").attr("pressed","false");

    } else {

        if(!$(".sw_brim .btn-toggle").hasClass("active")){
            $(".sw_brim .btn-toggle").addClass("active");
            $(".sw_brim .btn-toggle").addClass("focus");
        }
        $(".sw_brim .btn-toggle").attr("pressed","true");

    }

    if(raft_enable == 0){
        $(".sw_raft .btn-toggle").removeClass("active");
        $(".sw_raft .btn-toggle").removeClass("focus");
        $(".sw_raft .btn-toggle").attr("pressed","false");

    } else {

        if(!$(".sw_raft .btn-toggle").hasClass("active")){
            $(".sw_raft .btn-toggle").addClass("active");
            $(".sw_raft .btn-toggle").addClass("focus");
        }
        $(".sw_raft .btn-toggle").attr("pressed","true");

    }

    if(retraction_enable == 0){
        $(".sw_retraction .btn-toggle").removeClass("active");
        $(".sw_retraction .btn-toggle").removeClass("focus");
        $(".sw_retraction .btn-toggle").attr("pressed","false");

        //$(".inp_retraction").addClass("deactived");
        //$(".inp_retraction").prop( "disabled", true );
    } else {
        //$(".inp_retraction").removeClass("deactived");
        //$(".inp_retraction").prop( "disabled", false );

        if(!$(".sw_retraction .btn-toggle").hasClass("active")){
            $(".sw_retraction .btn-toggle").addClass("active");
            $(".sw_retraction .btn-toggle").addClass("focus");
        }
        $(".sw_retraction .btn-toggle").attr("pressed","true");
        $(".inp_retraction").val(retraction_enable);
    }

    $("#quality_slider")       // edit slider from preset value
        .slider({
            max: 8,
            min: 0,
            //range: "min",
            value: layer_height_index,
            orientation: "horizontal"
        })
        .slider("pips", {
            first: "pip",
            last: "pip"
        })
        .slider("float");

    $("#infill_slider")
        .slider({
            max: 10,
            min: 0,
            //range: "min",
            value: infill_density_slider,
            orientation: "horizontal"
        })
        .slider("pips", {
            first: "pip",
            last: "pip"
        })
        .slider("float");

    $("#speed_slider")       // define slider
        .slider({
            max: 11,
            min: 0,
            //range: "min",
            value: print_speed_index,
            orientation: "horizontal"
        })
        .slider("pips", {
            first: "pip",
            last: "pip"
        })
        .slider("float");

    $("#temp_end_slider")       // define slider
        .slider({
            max: 14,
            min: 0,
            //range: "min",
            value: end_temperature_index,
            orientation: "horizontal"
        })
        .slider("pips", {
            first: "pip",
            last: "pip"
        })
        .slider("float");

    $("#temp_bed_slider")       // define slider
        .slider({
            max: 14,
            min: 0,
            //range: "min",
            value: bed_temperature_index,
            orientation: "horizontal"
        })
        .slider("pips", {
            first: "pip",
            last: "pip"
        })
        .slider("float");

    $("#ext_mpt_slider")       // define slider
        .slider({
            max: 10,
            min: 0,
            //range: "min",
            value: ext_mpt_index,
            orientation: "horizontal"
        })
        .slider("pips", {
            first: "pip",
            last: "pip"
        })
        .slider("float");

    sliders_velue_set();

    // save preset << user settings

    fs.writeFileSync('./app_settings/last_config.ini', ini.stringify(config))
}

function sliders_velue_set(){
    $(".slider_value_qv").text(layers_array[$("#quality_slider .ui-slider-tip").html()] + " mm");
    $(".slider_value_sp").text($("#infill_slider .ui-slider-tip").html() * 10 + "%");
    $(".slider_value_speed").text(speed_array[$("#speed_slider .ui-slider-tip").html()] + " mm/s");
    $(".slider_value_tp_end").text(temp_end_array[$("#temp_end_slider .ui-slider-tip").html()] + " °C");
    $(".slider_value_tp_bed").text(temp_bed_array[$("#temp_bed_slider .ui-slider-tip").html()] + " °C");
    $(".slider_value_ext_mpt").text(ext_mpt_array[$("#ext_mpt_slider .ui-slider-tip").html()] + " %");

    setTimeout(function(){
        $("#quality_slider .ui-slider-tip").on('DOMSubtreeModified', function () {
            $(".slider_value_qv").text(layers_array[$("#quality_slider .ui-slider-tip").html()] + " mm");
            save_config();
        });
        $("#infill_slider .ui-slider-tip").on('DOMSubtreeModified', function () {
            $(".slider_value_sp").text($("#infill_slider .ui-slider-tip").html() * 10 + "%");
            save_config();
        });
        $("#speed_slider .ui-slider-tip").on('DOMSubtreeModified', function () {
            $(".slider_value_speed").text(speed_array[$("#speed_slider .ui-slider-tip").html()] + " mm/s");
            save_config();
        });
        $("#temp_end_slider .ui-slider-tip").on('DOMSubtreeModified', function () {
            $(".slider_value_tp_end").text(temp_end_array[$("#temp_end_slider .ui-slider-tip").html()] + " °C");
            save_config();
        });
        $("#temp_bed_slider .ui-slider-tip").on('DOMSubtreeModified', function () {
            $(".slider_value_tp_bed").text(temp_bed_array[$("#temp_bed_slider .ui-slider-tip").html()] + " °C");
            save_config();
        });
        $("#ext_mpt_slider .ui-slider-tip").on('DOMSubtreeModified', function () {
            $(".slider_value_ext_mpt").text(ext_mpt_array[$("#ext_mpt_slider .ui-slider-tip").html()] + " %");
            save_config();
        });
    }, 1000);   // dealyd for not running with loading
}

function save_config(){     // save preset << user settings

    console.log(">> saving settings");

    var selected_preset = $(".select-styled").html();   // get selected preset name
    selected_preset = selected_preset.replace(" ", "-");
    var index = settings_files.indexOf(selected_preset);
    var selected_preset_name = settings_file_names[index];

    var config = ini.parse(fs.readFileSync('./user_settings/' + selected_preset_name, 'utf-8')) // load selected preset file
    var app_config = ini.parse(fs.readFileSync('./app_settings/app_config.ini', 'utf-8'))

    if($(".infill_type .select-styled").html() == "Honeycomb"){
        config.fill_pattern = 'honeycomb';
    } else if($(".infill_type .select-styled").html() == "Rectilinear"){
        config.fill_pattern = 'rectilinear';
    } else if($(".infill_type .select-styled").html() == "3D Honeycomb"){
        config.fill_pattern = '3dhoneycomb';
    }

    if($(".sw_support .btn-toggle").hasClass("active")){
        config.support_material = "1";
    } else {
        config.support_material = "0";
    }

    if($(".sw_layer_fan .btn-toggle").hasClass("active")){
        config.cooling = "1";
    } else {
        config.cooling = "0";
    }

    if($(".sw_brim .btn-toggle").hasClass("active")){
        config.brim_width = app_config.brim_width;
    } else {
        config.brim_width = "0";
    }

    if($(".sw_raft .btn-toggle").hasClass("active")){
        config.raft_layers = app_config.raft_layers;
    } else {
        config.raft_layers = "0";
    }

    if($(".sw_retraction .btn-toggle").hasClass("active")){
        config.retract_length !== null ? config.retract_length = $(".inp_retraction").val() : config.retract_length = "2";
        console.log($(".inp_retraction").val());
        //config.retract_length = $(".inp_retraction").val();
    } else {
        config.retract_length = "0";
    }

    $(".label_preset_material").text(config.material_type);

    config.fill_density = $(".slider_value_sp").text();
    config.layer_height = $(".slider_value_qv").text().replace(" mm", "");
    config.max_print_speed = $(".slider_value_speed").text().replace(" mm/s", "");
    config.temperature = $(".slider_value_tp_end").text().replace(" °C", "");
    config.bed_temperature = $(".slider_value_tp_bed").text().replace(" °C", "");
    config.extrusion_multiplier = $(".slider_value_ext_mpt").text().replace(" %", "") / 100;

    setTimeout(function(){
        fs.writeFileSync('./app_settings/last_config.ini', ini.stringify(config))
    }, 600);

}

ipcRenderer.on('save_pres_fc_menu', function () {
    //window.open('save_pres.html', '_blank', 'nodeIntegration=yes, resizable=0, width=400, height=220');

    var child = window.open('save_pres.html', '_blank', 'nodeIntegration=yes, resizable=0, width=400, height=220');
    var timer = setInterval(checkChild, 500);

    function checkChild() {
        if (child.closed) {
            console.log(">> reload presets");
            setTimeout(function(){
                reload_presets_select();
                console.log(remote.getGlobal('test'));
            }, 400);
            clearInterval(timer);
        }
    }
});

function reload_presets_select(){   // this works dont touch it !!
    console.log("----reload preset----");
    settings_files = [];
    settings_file_names = [];
    const directoryPath = path.join(__dirname, 'user_settings');
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            var string_array = file.split("_");
            if(string_array.length == 2){
                if(string_array[0] == "preset" || string_array[0] == "user#preset"){
                    var name = string_array[1];
                    name = name.split(".")
                    if(name.length !== 2){
                        console.warn("incorrect settings file name");
                    }  else {
                        settings_files.push(name[0]);
                        settings_file_names.push(file);
                    }
                }
            } else {
                console.warn("incorrect settings file name");
            }
        });
    });

    setTimeout(function(){

        $(".preset_select").html("");
        $(".preset_select").html("<select id=\"preset\"></select>");

        for(var i = 0; i < settings_files.length; i++){
            var preset_name = settings_files[i].replace("-", " ");
            $(".preset_select select").append("<option value=" + preset_name + ">" + preset_name + "</option>");
        }

        console.log("loaded presets:");
        console.log(settings_files);
        console.log(settings_file_names);

        setTimeout(function(){
            reload_select_dialog();
        }, 200);

    }, 200);
}

var saved_pres_name;

function reload_select_dialog(){
    $('.preset_select select').each(function(){
        var $this = $(this), numberOfOptions = $(this).children('option').length;

        $this.addClass('select-hidden');
        $this.wrap('<div class="select"></div>');
        $this.after('<div class="select-styled"></div>');

        var $styledSelect = $this.next('div.select-styled');
        $styledSelect.text($this.children('option').eq(0).text());

        var $list = $('<ul />', {
            'class': 'select-options'
        }).insertAfter($styledSelect);

        for (var i = 0; i < numberOfOptions; i++) {
            $('<li />', {
                text: $this.children('option').eq(i).text(),
                rel: $this.children('option').eq(i).val()
            }).appendTo($list);
        }

        var $listItems = $list.children('li');

        $styledSelect.click(function(e) {
            e.stopPropagation();
            $('div.select-styled.active').not(this).each(function(){
                $(this).removeClass('active').next('ul.select-options').hide();
            });
            $(this).toggleClass('active').next('ul.select-options').toggle();
        });

        $listItems.click(function(e) {
            e.stopPropagation();
            $styledSelect.text($(this).text()).removeClass('active');
            $this.val($(this).attr('rel'));
            $list.hide();

            if($this.parent().parent().attr('class') == "preset_select"){
                console.log("select: " + $(".select-styled").html());
                load_preset($(".select-styled").html());

                save_last_preset_name();
            }
            save_config();
        });

        $(document).click(function() {
            $styledSelect.removeClass('active');
            $list.hide();
        });

        console.log(">> reload preset select");
        console.log(">> PRESET RELOADED");

        setTimeout(function(){
            load_preset();
            setTimeout(function(){
                $(".preset_select .select-styled").html(saved_pres_name);
            }, 200);
        }, 300);

    });
}

function reload_select_dialog_infill_type(){
    $('.infill_type select').each(function(){
        var $this = $(this), numberOfOptions = $(this).children('option').length;

        $this.addClass('select-hidden');
        $this.wrap('<div class="select"></div>');
        $this.after('<div class="select-styled"></div>');

        var $styledSelect = $this.next('div.select-styled');
        $styledSelect.text($this.children('option').eq(0).text());

        var $list = $('<ul />', {
            'class': 'select-options'
        }).insertAfter($styledSelect);

        for (var i = 0; i < numberOfOptions; i++) {
            $('<li />', {
                text: $this.children('option').eq(i).text(),
                rel: $this.children('option').eq(i).val()
            }).appendTo($list);
        }

        var $listItems = $list.children('li');

        $styledSelect.click(function(e) {
            e.stopPropagation();
            $('div.select-styled.active').not(this).each(function(){
                $(this).removeClass('active').next('ul.select-options').hide();
            });
            $(this).toggleClass('active').next('ul.select-options').toggle();
        });

        $listItems.click(function(e) {
            e.stopPropagation();
            $styledSelect.text($(this).text()).removeClass('active');
            $this.val($(this).attr('rel'));
            $list.hide();

            if($this.parent().parent().attr('class') == "infill_type"){
                console.log("select: " + $(".select-styled").html());
                load_preset($(".select-styled").html());

                save_last_preset_name();
            }
            save_config();
        });

        $(document).click(function() {
            $styledSelect.removeClass('active');
            $list.hide();
        });

        console.log(">> reload preset select");
        console.log(">> PRESET RELOADED");

        setTimeout(function(){
            load_preset();
            setTimeout(function(){
                $(".infill_type .select-styled").html(saved_pres_name);
            }, 200);
        }, 300);

    });
}

ipc.on('pres_name_send_render', function (event, arg) {  // get select preset name from save_pres js file
    console.log(arg);
    saved_pres_name = arg;
})

setTimeout(function(){
    load_last_preset_name();
}, 600);

function load_last_preset_name(){
    // load last selected preset
    var config_app = ini.parse(fs.readFileSync('./app_settings/app_config.ini', 'utf-8'))
    $(".preset_select .select-styled").html(config_app.last_selected_preset);
}

function save_last_preset_name(){
    console.log(">> saved pres name");
    // load last selected preset
    var config_app = ini.parse(fs.readFileSync('./app_settings/app_config.ini', 'utf-8'))
    config_app.last_selected_preset = $(".preset_select .select-styled").html();
    fs.writeFileSync('./app_settings/app_config.ini', ini.stringify(config_app))
}

// ----- gcode analyzer ----
ipc.on('print_time_send_render', function (event, arg) {  // get select preset name from save_pres js file
    console.log("print time: ");
    console.log(arg);
    gcode_print_time = arg;
    $(".gcode_view_info_msg").text("");
    $(".gcode_print_time").text("print time: " + gcode_print_time);
    $(".gcode_print_time").text("print time: " + parseInt(parseFloat(gcode_print_time)/60/60) + ":" + parseInt((parseFloat(gcode_print_time)/60)%60) + ":" + parseInt(parseFloat(gcode_print_time)%60));
})

$(document).on('click','#manual_btn', function(){
    load_manual_settings();
    $("#easy_s_btn").show();
    $("#manual_btn").hide();
})

$(document).on('click','#easy_s_btn', function(){
    load_easy_settings();
    $("#easy_s_btn").hide();
    $("#manual_btn").show();
})












//window.open(path.html,'_blank', 'toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,left=10000, top=10000, width=10, height=10, visible=none', '');
