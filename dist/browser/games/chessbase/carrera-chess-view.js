exports.view = View = {
    Game: {},
    Board: {},
    Move: {}
};


// base chess view

(function() {

	var cbVar, cbView, currentGame;
	
	View.Game.cbTargetMesh = "/res/ring-target.js";
	View.Game.cbTargetSelectColor = 0xffffff;
	View.Game.cbTargetCancelColor = 0xff8800;

	View.Game.cbPromoSize = 2000;
	
	View.Game.xdInit = function(xdv) {

		this.g.fullPath=this.mViewOptions.fullPath;
		this.cbPieceByType={};
		cbVar=this.cbVar;
		cbView=this.cbDefineView();
		this.cbView=cbView;
		this.cbClearPieces();
		this.cbCreateLights(xdv);
		this.cbCreateScreens(xdv);
		this.cbCreateBoard(xdv);
		this.cbCreatePromo(xdv);
		this.cbCreatePieces(xdv);
		this.cbCreateCells(xdv);
	}	
	
	// useful to initialize pieces and board while the real meshes aren't loaded yet
	View.Game.cbMakeDummyMesh = function(xdv) {
		if(typeof THREE != "undefined")
		    return new THREE.Mesh( new THREE.CubeGeometry( .0001, .0001, .0001 ), 
					      new THREE.MeshLambertMaterial() );
		else
			return null;
	}
	
	View.Game.cbCurrentGame = function() {
		return currentGame;
	}
	
	View.Game.cbCreatePieces = function(xdv) {

		var dummyMesh=this.cbMakeDummyMesh(xdv);

		for(var index=0;index<this.cbPiecesCount;index++) {
			xdv.createGadget("piece#"+index,{
				base: {
				},
				"2d": {
					type: "sprite",
				},
				"3d":{
					type:"custommesh3d",
					create: function(force,options,delay){
					    return dummyMesh;
					},
				},				
			});
		}
	}

	View.Game.cbCreateBoard = function(xdv) {
		//console.warn("View.Game.cbCreateBoard must be overriden");
		var dummyMesh=this.cbMakeDummyMesh(xdv);

		xdv.createGadget("board",{
			base: {
			},
			"2d": {
				type: "canvas",
				width: 12000,
				height: 12000,
				draw: function(ctx) {
					console.warn("board draw must be overridden");
				},
			},
			"3d":{
				type:"custommesh3d",
				receiveShadow:true,
				create: function(force,options,delay){
				    return dummyMesh;
				},
			},				
		});		
	}

	View.Game.cbCreateCells = function(xdv) {
		var $this=this;
		for(var pos=0;pos<this.g.boardSize;pos++) 
			(function(pos) {
				xdv.createGadget("cell#"+pos,{
					"2d": {
						z: 101,
						type: "element",
						initialClasses: $this.cbCellClass(xdv,pos),
						width: 1300,
						height: 1300,
					},					
				});
				xdv.createGadget("clicker#"+pos,$.extend(true,{
					"2d": {
						z: 103,
						type: "element",
						initialClasses: "cb-clicker",
					},
					"3d": {
						type: "meshfile",
						file : $this.g.fullPath+$this.cbTargetMesh,
						flatShading: true,
						castShadow: true,
						smooth : 0,
						scale:[.9,.9,.9],
						materials: { 
							"square" : {
								transparent: true,
								opacity: 0,
							},
							"ring" : {
								color : $this.cbTargetSelectColor,
								opacity: 1,
							}
						},
					}
				},$this.cbView.clicker));
			})(pos);
	}
	
	View.Game.cbCreatePromo = function(xdv) {
		xdv.createGadget("promo-board",{
			base: {
				type: "element",
				x: 0,
				y: 0,
				width: 2000,
				height: 2000,
				z: 108,
				css: {
					"background-color": "White",
				},
			},
		});
		xdv.createGadget("promo-cancel",{
			base: {
				type: "image",
				file: this.g.fullPath+"/res/images/cancel.png",
				x: 0,
				y: 0,
				width: 800,
				height: 800,
				z: 109,
			},
		});
		for(var i=0;i<this.g.pTypes.length;i++) {
			xdv.createGadget("promo#"+i,{
				base: {
					y: 0,
					z: 109,
					type: "sprite",
					clipwidth: 100,
					clipheight: 100,
					width: 1200,
					height: 1200,
				},
			});
		}
	}
	
	View.Game.xdBuildScene = function(xdv){

		currentGame=this;
		cbVar=this.cbVar;
		cbView=this.cbDefineView();
		this.cbView=cbView;

		for(var i=0;i<this.cbExtraLights.length;i++) {
			xdv.updateGadget("extralights#"+i,{
				"3d":{
					visible:true,
				}
			});
		}
		
		xdv.updateGadget("board",$.extend({
			base: {
				visible: true,
			},
		},this.cbView.board));
		for(var pos=0;pos<this.g.boardSize;pos++) {
			(function(pos) {
				var displaySpec=currentGame.cbMakeDisplaySpec(pos,0);
				var cellSpec=$.extend(true,{},displaySpec,{
					"base": {
						visible: true,
					},
				},currentGame.cbView.clicker,currentGame.cbView.cell);
				xdv.updateGadget("cell#"+pos,cellSpec);
				$.extend(true,displaySpec,currentGame.cbView.clicker);
				xdv.updateGadget("clicker#"+pos,displaySpec);
			})(pos);
		}
		
		var scaleScreen=3;
		var zScreen=3000;
		var zScreenVignette=1500;
		var yScreen=10000;
		var screenAngle=0;
		var thumbDist=.89;
		var thumbOffset=5500;		
		var inclination=25;
		
		xdv.updateGadget("videoa",{
			"3d": {
				visible: true,
				playerSide: 1,
				z: zScreen,
				y: this.mViewAs==1?yScreen:-yScreen,
				rotate: this.mViewAs==1?-(180+screenAngle):-screenAngle,
				rotateX: this.mViewAs==1?inclination:-inclination,
				scale: [scaleScreen,scaleScreen,scaleScreen],
			},
		});
		xdv.updateGadget("videoabis",{
			"3d": {
				visible: true,
				playerSide: -1,
				z: zScreenVignette,
				x: this.mViewAs==1?-thumbOffset:thumbOffset,
				y: this.mViewAs==1?thumbDist*yScreen:-thumbDist*yScreen,
				rotate: this.mViewAs==1?-(180+screenAngle):-screenAngle,
				rotateX: this.mViewAs==1?inclination:-inclination,
				scale: [scaleScreen/4,scaleScreen/4,scaleScreen/4],
			},
		});

		xdv.updateGadget("videob",{
			"3d": {
				visible: true,
				playerSide: -1,
				z: zScreen,
				y: this.mViewAs==1?-yScreen:yScreen,
				rotate: this.mViewAs==1?-screenAngle:-(180+screenAngle),
				rotateX: this.mViewAs==1?-inclination:inclination,
				scale: [scaleScreen,scaleScreen,scaleScreen],
			},
		});
		xdv.updateGadget("videobbis",{
			"3d": {
				visible: true,
				playerSide: 1,
				z: zScreenVignette,
				x: this.mViewAs==1?thumbOffset:-thumbOffset,
				y: this.mViewAs==1?-thumbDist*yScreen:thumbDist*yScreen,
				rotate: this.mViewAs==1?-screenAngle:-(180+screenAngle),
				rotateX: this.mViewAs==1?-inclination:inclination,
				scale: [scaleScreen/4,scaleScreen/4,scaleScreen/4],
			},
		});
		
		xdv.updateGadget("promo-board",{
			base: {
				visible: false,
			},
		});
		xdv.updateGadget("promo-cancel",{
			base: {
				visible: false,
			},
		});
		for(var i=0;i<this.g.pTypes.length;i++) {
			xdv.updateGadget("promo#"+i,{
				base: {
					visible: false,
				},
			});
		};
	}
	
	View.Game.cbDisplayBoardFn = function(spec) {
		
		var $this=this;
		
		return function(force,options,delay) {

			var key = spec.style+"_"+spec.margins.x+"_"+spec.margins.y+"_"+$this.mNotation+"_"+$this.mViewAs;
			
			var avat=this;
			if(key!=this._cbKey){
				this._cbKey=key;
				spec.display.call(currentGame,spec,avat,function(mesh) {
					avat.replaceMesh(mesh,options,delay);
				});
			}
		}
	}

	View.Game.cbDrawBoardFn = function(spec) {
		return function(ctx) {
			spec.draw.call(currentGame,spec,this,ctx);
		}
	}
	
	View.Game.cbMakeDisplaySpec = function(pos,side) {
		var displaySpec={};		
		for(var c in this.cbView.coords) {
			var coordsFn=this.cbView.coords[c];
			var coord=coordsFn.call(this,pos);
			displaySpec[c]={
				x: coord.x || 0,
				y: coord.y || 0,
				z: coord.z || 0,
				rotateX: coord.rx || 0,
				rotateY: (coord.ry || 0) * (c=="3d"?(this.mViewAs*side<0?-1:1):0), // TODO handle better side orientation
				rotate: (coord.rz || 0) + (c=="3d"?(this.mViewAs*side<0?180:0):0), // TODO handle better side orientation
				/*
				rotateY: coord.ry || 0,
				rotate: (coord.rz || 0) + (c=="3d"?(this.mViewAs*side>0?0:180):0), // TODO handle better side orientation
				*/
			}
		}
		return displaySpec;
	}
	
	View.Game.cbMakeDisplaySpecForPiece = function(aGame,pos,piece) {
		var displaySpec=this.cbMakeDisplaySpec(pos,piece.s);		
		if(cbVar.pieceTypes[piece.t]===undefined) {
			console.warn("Piece type",piece.t,"not defined in model");
			return;
		}
		var aspect=cbVar.pieceTypes[piece.t].aspect || cbVar.pieceTypes[piece.t].name;
		if(!aspect) {
			console.warn("Piece type",piece.t,"has no aspect defined");
			return;				
		}
		function BuildSpec(spec,specs,aspect) {
			if(specs)
				return $.extend(true,spec,specs['default'],specs[aspect]);
			return {};
		}
//		displaySpec=BuildSpec(displaySpec,aGame.cbPieces,aspect);
//		if(aGame.cbPieces[piece.s])
//			displaySpec=BuildSpec(displaySpec,aGame.cbPieces[piece.s],aspect);
		if(cbView.pieces) {
			displaySpec=BuildSpec(displaySpec,cbView.pieces,aspect);
			if(cbView.pieces[piece.s])
				displaySpec=BuildSpec(displaySpec,cbView.pieces[piece.s],aspect);
		}
		return displaySpec;
	}
	
	View.Board.xdDisplay = function(xdv, aGame) {
		var $this=this;
		for(var index=0;index<this.pieces.length;index++) {
			var piece=this.pieces[index];
			if(piece.p<0)
				xdv.updateGadget("piece#"+index,{
					base: {
						visible: false,
					}
				});
			else {
				var displaySpec=aGame.cbMakeDisplaySpecForPiece(aGame,piece.p,piece);
				displaySpec=$.extend(true,{
					base: {
						visible: true,
					},
					"2d": {
						opacity: 1,
					},
					"3d": {
						positionEasingUpdate: null,												
					},
				},displaySpec);
				
				//console.warn("display",displaySpec);
					
				xdv.updateGadget("piece#"+index,displaySpec);
			}
		}
		for(;index<aGame.cbPiecesCount;index++)
			xdv.updateGadget("piece#"+index,{
				base: {
					visible: false,
				}
			});
	}
	
	View.Game.cbExtraLights = [{
		color: 0xffffff,
		intensity: 0.8,
		position: [9, 14, -9],
		props: {
			shadowCameraNear: 10,
			shadowCameraFar: 25,
			castShadow: true,
			//shadowDarkness: .25,
			shadowMapWidth: 2048,
			shadowMapHeight: 2048,
		},
	}]; 

	View.Game.cbCreateLights = function(xdv) {
		var $this = this;
		// lights
		for(var i=0;i<this.cbExtraLights.length;i++) {
			(function(light,index) {
				xdv.createGadget("extralights#"+index,{
					"3d": {
						type: "custommesh3d",
						create: function(callback){
							// spot lighting
							var spotLight1 = new THREE.SpotLight( light.color, light.intensity );
							//for(var prop in light.props)
								//spotLight1[prop] = light.props[prop];
							
							spotLight1.shadow.camera.far = light.props.shadowCameraFar;
							spotLight1.shadow.camera.near = light.props.shadowCameraNear;
							spotLight1.shadow.mapSize.width = light.props.shadowMapWidth;
							spotLight1.shadow.mapSize.height = light.props.shadowMapHeight;

							spotLight1.position.set.apply(spotLight1.position,light.position);	
							var mesh=new THREE.Mesh();
							mesh.add(spotLight1);
							var target = new THREE.Object3D();
							mesh.add(target);
							spotLight1.target = target;

							callback(mesh);
						},
					}
				});
				
			})(this.cbExtraLights[i],i);
		}
	}
	
	// 'this' is not a Game but an Avatar object
	View.Game.cbCreateScreen = function(videoTexture) {
		// flat screens
		var gg=new THREE.PlaneGeometry(4,3,1,1);
		var gm=new THREE.MeshPhongMaterial({color:0xffffff,map:videoTexture,shading:THREE.FlatShading,emissive:{r:1,g:1,b:1}});
		var mesh = new THREE.Mesh( gg , gm );
		this.objectReady(mesh); 
		return null;
	}
	
	View.Game.cbCreateScreens = function(xdv) {
		var $this=this;
		xdv.createGadget("videoa",{
			"3d": {
				type : "video3d",				
				makeMesh: function(videoTexture){
					return $this.cbCreateScreen.call(this,videoTexture);
				},
			},
		});
		xdv.createGadget("videoabis",{
			"3d": {
				type : "video3d",				
				makeMesh: function(videoTexture){
					return $this.cbCreateScreen.call(this,videoTexture);
				},
			},
		});
		xdv.createGadget("videob",{
			"3d": {
				type : "video3d",				
				makeMesh: function(videoTexture){
					return $this.cbCreateScreen.call(this,videoTexture);
				},
			},
		});	
		xdv.createGadget("videobbis",{
			"3d": {
				type : "video3d",				
				makeMesh: function(videoTexture){
					return $this.cbCreateScreen.call(this,videoTexture);
				},
			},
		});
	}
	
	View.Board.xdInput = function(xdv, aGame) {
		
		function HidePromo() {
			xdv.updateGadget("promo-board",{
				base: {
					visible: false,
				}
			});
			xdv.updateGadget("promo-cancel",{
				base: {
					visible: false,
				}
			});		
		}
		
		return {
			initial: {
				f: null,
				t: null,
				pr: null,
			},
			getActions: function(moves,currentInput) {
				var actions={};
				if(currentInput.f==null) {
					moves.forEach(function(move) {
						if(actions[move.f]===undefined)
							actions[move.f]={
								f: move.f,
								moves: [],
								click: ["piece#"+this.board[move.f],"clicker#"+move.f],
								view: ["clicker#"+move.f],
								highlight: function(mode) {
									xdv.updateGadget("cell#"+move.f,{
										"2d": {
											classes: mode=="select"?"cb-cell-select":"cb-cell-cancel",					
											opacity: aGame.mShowMoves || mode=="cancel"?1:0,
										}
									});									
									xdv.updateGadget("clicker#"+move.f,{
										"3d": {
											materials: {
												ring: {
													color: mode=="select"?aGame.cbTargetSelectColor:aGame.cbTargetCancelColor,
													opacity: aGame.mShowMoves || mode=="cancel"?1:0,
													transparent: aGame.mShowMoves || mode=="cancel"?false:true,
												},
											},
											castShadow: aGame.mShowMoves || mode=="cancel",
										},
									});									
								},
								unhighlight: function() {
									xdv.updateGadget("cell#"+move.f,{
										"2d": {
											classes: "",							
										}
									});									
								},
								validate: {
									f: move.f,
								},
							}
						actions[move.f].moves.push(move);
					},this);
				} else if(currentInput.t==null) {
					moves.forEach(function(move) {
						var target = move.cg===undefined?move.t:move.cg;
						if(actions[target]===undefined) {
							actions[target]={
								t: move.t,
								moves: [],
								click: ["piece#"+this.board[target],"clicker#"+target],
								view: ["clicker#"+target],
								highlight: function(mode) {
									xdv.updateGadget("cell#"+target,{
										"2d": {
											classes: mode=="select"?"cb-cell-select":"cb-cell-cancel",					
											opacity: aGame.mShowMoves || mode=="cancel"?1:0,
										},
									});									
									xdv.updateGadget("clicker#"+target,{
										"3d": {
											materials: {
												ring: {
													color: mode=="select"?aGame.cbTargetSelectColor:aGame.cbTargetCancelColor,
													opacity: aGame.mShowMoves || mode=="cancel"?1:0,
													transparent: aGame.mShowMoves || mode=="cancel"?false:true,
												},
											},
											castShadow: aGame.mShowMoves || mode=="cancel",
										},
									});									
								},
								unhighlight: function(mode) {
									xdv.updateGadget("cell#"+target,{
										"2d": {
											classes: "",							
										}
									});									
								},
								validate: {
									t: move.t,
								},
								execute: function(callback) {
									var $this=this;
									this.cbAnimate(xdv,aGame,move,function() {
										var promoMoves=actions[move.t].moves;
										if(promoMoves.length>1) {
											xdv.updateGadget("promo-board",{
												base: {
													visible: true,
													width: aGame.cbPromoSize*(promoMoves.length+1),
												}
											});
											xdv.updateGadget("promo-cancel",{
												base: {
													visible: true,
													x: promoMoves.length*aGame.cbPromoSize/2,
												}
											});
											promoMoves.forEach(function(move,index) {
												var aspect=cbVar.pieceTypes[move.pr].aspect || cbVar.pieceTypes[move.pr].name;
												var aspectSpec = $.extend(true,{},aGame.cbView.pieces["default"],aGame.cbView.pieces[aspect]);
												if(aGame.cbView.pieces[this.mWho])
													aspectSpec = $.extend(true,aspectSpec,
															aGame.cbView.pieces[this.mWho]["default"],aGame.cbView.pieces[this.mWho][aspect]);
												xdv.updateGadget("promo#"+move.pr, {
													base: $.extend(aspectSpec["2d"], { 
														x: (index-promoMoves.length/2)*aGame.cbPromoSize 
													}),														
												});												
											},$this);
										}
										callback();
									});
								},
								unexecute: function() {
									if(move.c!=null) {
										var piece1=this.pieces[move.c];
										var displaySpec1=aGame.cbMakeDisplaySpecForPiece(aGame,piece1.p,piece1);
										displaySpec1=$.extend(true,{
											base: {
												visible: true,
											},
											"2d": {
												opacity: 1,
											},
											"3d": {
												positionEasingUpdate: null,												
											},
										},displaySpec1);
										xdv.updateGadget("piece#"+move.c,displaySpec1);
									}
									var piece=this.pieces[this.board[move.f]];
									var displaySpec=aGame.cbMakeDisplaySpecForPiece(aGame,piece.p,piece);
									xdv.updateGadget("piece#"+piece.i,displaySpec);
									HidePromo();
								},
							}
						}
						if(move.cg!==undefined) {
							actions[target].validate.cg=move.cg;
							actions[target].execute=function(callback) {
								this.cbAnimate(xdv,aGame,move,function() {
									callback();
								});
							};
						}
						actions[target].moves.push(move);
					},this);
				} else if(currentInput.pr==null) {
					var promos=[];
					moves.forEach(function(move) {
						if(move.pr!==undefined) {
							if(actions[move.pr]===undefined) {
								actions[move.pr]={
									pr: move.pr,
									moves: [],
									click: ["promo#"+move.pr],
									//view: ["promo#"+move.pr],
									validate: {
										pr: move.pr,
									},
									cancel: ["promo-cancel"],
									post: HidePromo,
									skipable: true,
								}
								promos.push(move.pr);
							}
							actions[move.pr].moves.push(move);
						}
					},this);
					if(promos.length>1) // avoid loading the avatar if forced promotion (only 1 choice)
						promos.forEach(function(pr) {
							actions[pr].view=["promo#"+pr];
						});
				}
				return actions;
			},
		}
	}

	View.Game.cbCellClass = function(xdv, pos) {
		var cellClass;
		if((pos+(pos-pos%this.g.NBCOLS)/this.g.ROWS)%2)
			cellClass="classic-cell-black";
		else
			cellClass="classic-cell-white";
		return "classic-cell "+cellClass;
	}	
		
	View.Board.xdPlayedMove = function(xdv, aGame, aMove) {
		aGame.mOldBoard.cbAnimate(xdv,aGame,aMove,function() {
			aGame.MoveShown();
		});
	}

	View.Board.cbAnimate = function(xdv,aGame,aMove,callback) {
		var $this=this;
		var animCount=1;
		var tacSound=false;
		
		function EndAnim() {
			if(--animCount==0){
				if(tacSound)
					aGame.PlaySound("tac"+(1+Math.floor(Math.random()*3)));
				callback();
			}
		}
		var piece=this.pieces[this.board[aMove.f]];

		var displaySpec0=aGame.cbMakeDisplaySpec(aMove.f,piece.s);
		var displaySpec=aGame.cbMakeDisplaySpecForPiece(aGame,aMove.t,piece);
		for(var skin in displaySpec0) {
			var spec=displaySpec0[skin];
			if(spec.z===undefined)
				continue;
			(function(skin) {
				var z0=spec.z;
				var z2=displaySpec[skin].z;
				var z1=$this.cbMoveMidZ(aGame,aMove,z0,z2,skin);
				var c=z0;
				var S1=c-z1;
				var S2=c-z2;
				
				if(z1!=(z0+z2)/2)
					tacSound=true;

				var A=-1;
				var B=4*S1-2*S2;
				var C=-S2*S2;
				var D=Math.abs(B*B-4*A*C);
				var a1=(-B-Math.sqrt(D))/(2*A);
				var a2=(-B+Math.sqrt(D))/(2*A);
				var a=a1;
				var b=-a-S2;
				if(a==0 || -b/(2*a)<0 || -b/(2*a)>1) {
					a=a2;
					b=-a-S2;
				}
				displaySpec[skin].positionEasingUpdate = function(ratio) {
					var y=(a*ratio*ratio+b*ratio+c)*this.SCALE3D;
					this.object3d.position.y=y;
				}
			})(skin);
		}

		if (!tacSound)
			aGame.PlaySound("move"+(1+Math.floor(Math.random()*4)));
		
		xdv.updateGadget("piece#"+piece.i,displaySpec,600,function() {
			EndAnim();
		});

		if(aMove.c!=null) {
			animCount++;
			var anim3d={
				positionEasingUpdate: null,
			};
			switch(aGame.cbView.captureAnim3d || "movedown") {
			case 'movedown':
				anim3d.z=-2000;
				break;
			case 'scaledown':
				anim3d.scale=[0,0,0];
				break;
			}
			var piece1=this.pieces[aMove.c];
			xdv.updateGadget("piece#"+piece1.i,{
				"2d": {
					opacity: 0,
				},
				"3d": anim3d,
			},600,EndAnim);
		}
		
		if(aMove.cg!==undefined) {
			var spec=aGame.cbVar.castle[aMove.f+"/"+aMove.cg];
			var rookTo=spec.r[spec.r.length-1];
			var piece=this.pieces[this.board[aMove.cg]];
			var displaySpec=aGame.cbMakeDisplaySpecForPiece(aGame,rookTo,piece);
			animCount++;
			xdv.updateGadget("piece#"+piece.i,displaySpec,600,function() {
				EndAnim();
			});
		}
	}

	View.Board.cbMoveMidZ = function(aGame,aMove,zFrom,zTo) {
		return (zFrom+zTo)/2;
	}

	
})();


// base board management


(function() {

	
	View.Game.cbBaseBoard = {

		TEXTURE_CANVAS_CX: 1024,
		TEXTURE_CANVAS_CY: 1024,	

		// 'this' is a Game object
		display: function(spec, avatar, callback) {
			var $this=this;
			spec.getResource=avatar.getResource;
			spec.createGeometry.call(this,spec,function(geometry) {
				spec.createTextureImages.call($this,spec,function(images) {
					var channels=['diffuse'].concat(spec.extraChannels || []);
					var canvas={};
					channels.forEach(function(channel) {
						var canvas0=document.createElement('canvas');
						canvas0.width=spec.TEXTURE_CANVAS_CX;
						canvas0.height=spec.TEXTURE_CANVAS_CY;
						canvas[channel]=canvas0;
					});
					spec.createMaterial.call($this,spec,canvas,function(material) {
						var mesh=new THREE.Mesh(geometry,material);
						spec.modifyMesh.call($this,spec,mesh,function(mesh) {
							spec.paint.call($this,spec,canvas,images,function() {
								callback(mesh);
							});
						});
					});					
				});
			});
		},
		
		createTextureImages: function(spec,callback) {
			var $this=this;
			var images={};
			var nbRes=0;
			var texturesImg=spec.texturesImg || {};
			for(var ti in texturesImg)
				nbRes++;
			if(nbRes==0)
				callback(images);
			else
				for(var ti in texturesImg)
					(function(ti) {
						spec.getResource("image|"+$this.g.fullPath+texturesImg[ti],function(img){
							images[ti]=img;
							if(--nbRes==0)
								callback(images);
						});
					})(ti);

		},
		
		createMaterial: function(spec,canvas,callback) {
			var texBoardDiffuse = new THREE.Texture(canvas.diffuse);
			texBoardDiffuse.needsUpdate = true;
			var matSpec={
				specular: '#050505',//'#222222',
				//emissive: '#333333',
				shininess: 30, //50,
				map: texBoardDiffuse,
			}
			if(canvas.bump) {
				var texBoardBump = new THREE.Texture(canvas.bump);
				texBoardBump.needsUpdate = true;
				matSpec.bumpMap = texBoardBump;
				matSpec.bumpScale = 0.05;//0.1;
			}
			var material=new THREE.MeshPhongMaterial(matSpec);
			callback(material);
		},

		modifyMesh: function(spec,mesh,callback) {
			callback(mesh);
		},

		prePaint: function(spec,mesh,canvas,images,callback) {
			callback();
		},

		paint: function(spec,mesh,canvas,images,callback) {
			callback();
		},

		postPaint: function(spec,mesh,canvas,images,callback) {
			callback();
		},

		paintChannel: function(spec,ctx,images,channel) {
			
		},
		
		draw: function(spec,avatar,ctx) {
			var $this=this;
			spec.getResource=avatar.getResource;
			//ctx.save();
			spec.createTextureImages.call(this,spec,function(images) {
				spec.paintChannel.call($this,spec,ctx,images,"diffuse");
				//ctx.restore();
			});
		},
		
	}

	
})();

// base piece management

(function() {

	var pieces = {}, getResource;

	function Hash(obj) {
		var str=JSON.stringify(obj);
		var h=0;
		for(var i=0;i<str.length;i++) {
			h=(h<<5)-h+str.charCodeAt(i);
			h&=h;
		}
		return h;
	}
	
	View.Game.cbDisplayPieceFn = function(styleSpec) {
		
		var $this=this;
		var styleSign=Hash(styleSpec);

		return function(force,options,delay){
			getResource = this.getResource;	
			var m=/^piece#([0-9]+)$/.exec(this.gadget.id);
			if(!m)
				return null;
			var index=parseInt(m[1]);
			var currentGame=$this.cbCurrentGame();
			if(index>=currentGame.mBoard.pieces.length)
				return null;
			var piece=currentGame.mBoard.pieces[index];
			var aspect=currentGame.cbVar.pieceTypes[piece.t].aspect || currentGame.cbVar.pieceTypes[piece.t].name;

			var key=aspect+"_"+styleSign+"_"+piece.s;
			var avat=this;
			if(key!=this._cbKey){
				this._cbKey=key;
				avat.options=options;
				currentGame.cbMakePiece(styleSpec,aspect,piece.s,function(mesh){
					avat.replaceMesh(mesh,avat.options,delay);
				});				
			}
		}
	}
	
	View.Game.cbMakePiece = function(styleSpec,aspect,side,callback) {
		
		if(!styleSpec) {
			console.error("piece-view: style is not defined");
			return;
		}
		
		function BuildSpec(spec,specs,aspect) {
			if(specs)
				return $.extend(true,spec,specs['default'],specs[aspect]);
			return {};
		}
		var aspectSpec=BuildSpec({},styleSpec,aspect);
		if(styleSpec[side])
			aspectSpec=BuildSpec(aspectSpec,styleSpec[side],aspect);
		var aspectKey=Hash(aspectSpec);
		var piece=pieces[aspectKey];
		if(Array.isArray(piece))
			piece.push(callback);
		else if(!piece) {
			pieces[aspectKey] = [ callback ];
			aspectSpec.loadResources.call(this,aspectSpec,function(resources) {
				aspectSpec.displayPiece.call(this,aspectSpec,resources,function() {
					var callbacks = pieces[aspectKey];
					pieces[aspectKey] = {
						geometry: resources.geometry,
						material: resources.material,
					}
					callbacks.forEach(function(callback) {
						callback(new THREE.Mesh(resources.geometry,resources.material));
					});
				});				
			});
		} else 
			callback(new THREE.Mesh(piece.geometry,piece.material));			
	}

	View.Game.cbClearPieces = function() {
		pieces = {};
	}
	
	View.Game.cbBasePieceStyle = {

		"default": {
			mesh: {
				jsFile: function(spec,callback) {
					callback(new THREE.CubeGeometry(1,1,1),new THREE.MeshPhongMaterial({}));
				},
				smooth: 0,
				rotateZ: 0,
			},

			loadMesh: function(spec,callback) {
				if(typeof spec.mesh.jsFile=="function")
					spec.mesh.jsFile(spec,callback);
				else
					getResource("smoothedfilegeo|"+spec.mesh.smooth+"|"+this.g.fullPath+spec.mesh.jsFile,callback);
			},

			loadImages: function(spec,callback) {
				var $this=this;
				var nbRes=1;
				var images={};
				function Loaded() {
					if(--nbRes==0)
						callback(images);
				}
				for(var mat in spec.materials) {
					var channels=spec.materials[mat].channels;
					for(var channel in channels) {
						if(channels[channel].texturesImg)
							for(var img in channels[channel].texturesImg)
								(function(img,url) {
									nbRes++;
									getResource("image|"+$this.g.fullPath+url,function(image) {
										images[img]=image;
										Loaded();
									});
								})(img,channels[channel].texturesImg[img]);
					}
				}
				Loaded();
			},
			
			loadResources: function(spec,callback) {
				var nbRes=2;
				var images, geometry,materials;
				
				function Loaded() {
					if(--nbRes==0)
						callback({
							geometry: geometry,
							images: images,
							textures: {},
							loadedMaterials: materials,
						});
				}
				spec.loadMesh.call(this,spec,function(geo,mats) {
					if(!geo._cbZRotated) {
						var matrix = new THREE.Matrix4();
						matrix.makeRotationY(spec.mesh.rotateZ*Math.PI/180)
						geo.applyMatrix(matrix);
						geo._cbZRotated=true;
					}
					geometry=geo;
					materials=mats;
					//materials=mats;
					Loaded();
				});
				spec.loadImages.call(this,spec,function(imgs) {
					images=imgs;
					Loaded();
				});
			},
						
			displayPiece: function(spec,resources,callback) {
				spec.makeMaterials.call(this,spec,resources);
				callback();
			},
			
			paintTextureImageClip: function(spec,ctx,material,channel,channelData,imgKey,image,clip,resources) {
				var cx=ctx.canvas.width;
				var cy=ctx.canvas.height;
				if(channelData.patternFill && channelData.patternFill[imgKey]) {
					var fillKey=channelData.patternFill[imgKey];	
					ctx.save();
					// use a tmp canvas for painting colored patterns with shape used as mask (alpha channel needed)
					var tmpCanvas = document.createElement('canvas');
					tmpCanvas.width=cx;
					tmpCanvas.height=cy;
					ctxTmp=tmpCanvas.getContext('2d');
			        ctxTmp.fillStyle=fillKey;
			        ctxTmp.fillRect(0,0,cx,cy);
			        ctxTmp.globalCompositeOperation='destination-in';
					ctxTmp.drawImage(image,clip.x,clip.y,clip.cx,clip.cy,0,0,cx,cy);
					// now paste the result in diffuse canvas
					ctx.drawImage(tmpCanvas,0,0,cx,cy,0,0,cx,cy);
					ctx.restore();
				}
				else
					ctx.drawImage(image,clip.x,clip.y,clip.cx,clip.cy,0,0,cx,cy);				
			},
			
			paintTextureImage: function(spec,ctx,material,channel,channelData,imgKey,image,resources) {
				var clip;
				if(channelData.clipping && channelData.clipping[imgKey])
					clip=channelData.clipping[imgKey];
				else
					clip={
						x: 0,
						y: 0,
						cx: image.width,
						cy: image.height
					};
				spec.paintTextureImageClip.call(this,spec,ctx,material,channel,channelData,imgKey,image,clip,resources);
			},
			
			paintTexture: function(spec,ctx,material,channel,resources) {
				//console.log("paintTexture",channel,"for",spec.mesh.jsFile);
				var channelData=spec.materials[material].channels[channel];
				for(var img in channelData.texturesImg) {
					var image=resources.images[img];
					spec.paintTextureImage.call(this,spec,ctx,material,channel,channelData,img,image,resources);
				}
			},
			
			makeMaterialTextures: function(spec,material,resources) {
		    	for (var chan in spec.materials[material].channels) {
		    		var channel = spec.materials[material].channels[chan];
		    		var canvas = document.createElement('canvas');
		    		canvas.width=channel.size.cx;
		    		canvas.height=channel.size.cy;
		    		var ctx = canvas.getContext('2d');
		    		spec.paintTexture.call(this,spec,ctx,material,chan,resources);
		    		var texture =  new THREE.Texture(canvas);
		    		texture.needsUpdate = true;
		    		resources.textures[material][chan]=texture;
	    		}
			},

			makeMaterials: function(spec,resources) {
				resources.textures={};
		    	for (var m in spec.materials) {
		    		resources.textures[m]={}
		    		spec.makeMaterialTextures.call(this,spec,m,resources)
	    			spec.makeMaterial.call(this,spec,m,resources);
		    	}
			},
		}		
	}
	
	View.Game.cbTokenPieceStyle3D = $.extend(true,{},View.Game.cbBasePieceStyle,{

		"default": {

			makeMaterials: function(spec,resources) {
				resources.textures={};
		    	for (var m in spec.materials) {
		    		resources.textures[m]={}
		    		spec.makeMaterialTextures.call(this,spec,m,resources)
		    	}

		    	var pieceMaterials=[];
	    		for (var mat in resources.loadedMaterials){
	    			var newMat=resources.loadedMaterials[mat].clone();	    			
	    			var matName=newMat.name;
	    			if (spec.materials[matName]){
		    			$.extend(true,newMat,spec.materials[matName].params);
						for (var chan in spec.materials[matName].channels) {
							switch (chan){
							case 'diffuse':
								newMat.map = resources.textures[matName][chan];
								break;
							case 'bump':
								newMat.bumpMap = resources.textures[matName][chan];
								break;
							}
						}
	    			}
	    			pieceMaterials.push(newMat);
	    		}
				var pieceMat = new THREE.MultiMaterial( pieceMaterials );
				resources.material=pieceMat;
			},

			
		},
	});

	View.Game.cbUniformPieceStyle3D = $.extend(true,{},View.Game.cbBasePieceStyle,{

		"default": {

			makeMaterial: function(spec,material,resources) {
	    		/*var shader = THREE.ShaderLib[ "normalmap" ];
				var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	    		var phongParams = spec.materials[material].params;
				for (var chan in spec.materials[material].channels) {
					var chanParams=spec.materials[material].channels[chan];
					switch (chan) {
					case 'diffuse':
						phongParams.map = resources.textures[material][chan];
						break;
					case 'normal':                        
						uniforms[ "tNormal" ].value = resources.textures[material][chan];
						uniforms[ "uNormalScale" ].value.y = chanParams.normalScale || 1;
						phongParams.normalMap = uniforms[ "tNormal" ].value ;
						phongParams.normalScale = uniforms[ "uNormalScale" ].value ;                        
					break;
					default:
					}
				}
				uniforms[ "enableAO" ].value = true;					
				//uniforms[ "tNormal" ].value = texNorm;
				//uniforms[ "uNormalScale" ].value.y = cbPieceType.normalScale;
				if(uniforms[ "uShininess" ] !== undefined)
					uniforms[ "uShininess" ].value = spec.materials[material].params['shininess'] || 100; */

				var phongParams = spec.materials[material].params ;
				phongParams.map = resources.textures[material]['diffuse'] ;
				phongParams.normalMap = resources.textures[material]['normal'] ;
				var ns = spec.materials[material].channels['normal'].normalScale || 1;
				phongParams.normalScale = new THREE.Vector2( ns , ns ) ;

				var pieceMat = new THREE.MeshPhongMaterial( phongParams );
				
				resources.material=pieceMat;
				
				resources.geometry.mergeVertices()
				resources.geometry.computeVertexNormals(); // needed in normals not exported in js file!

			},

			
		}
		
	});
	
	View.Game.cbPhongPieceStyle3D = $.extend(true,{},View.Game.cbBasePieceStyle,{

		"default": {

			phongProperties : {
				color: "#ffffff",
				shininess: 300,
				specular: "#ffffff",
				emissive: "#222222",
				shading: typeof THREE!="undefined"?THREE.FlatShading:0,
			},
			makeMaterials: function(spec,resources) {
				var pieceMat = new THREE.MeshPhongMaterial( spec.phongProperties );
				resources.material=pieceMat;
			},
		}
		
	});
	
})();




(function() {
	
	var JOCLY_FIELD_SIZE=12000; // physical space

	var NBCOLS=0, NBROWS=0, CSIZES={};
	
	View.Game.cbEnsureConstants =function() {
		if(NBROWS)
			return;
		NBROWS=this.cbVar.geometry.height;
		NBCOLS=this.cbVar.geometry.width;
	}
	
	// 'this' is a Game object
	View.Game.cbCSize =function(boardSpec) {
		this.cbEnsureConstants();
		var cSize=CSIZES[boardSpec.margins.x+"_"+boardSpec.margins.y];
		if(!cSize) {

			var ratio,width,height,cellSize;
			
			var relWidth = NBCOLS+2*boardSpec.margins.x;
			var relHeight = NBROWS+2*boardSpec.margins.y;
			
			ratio =  relWidth / relHeight;
			if(ratio<1)
				cellSize = (JOCLY_FIELD_SIZE * ratio) / relWidth;
			else 
				cellSize = (JOCLY_FIELD_SIZE / ratio) / relHeight;
			width = (NBCOLS+2*boardSpec.margins.x) * cellSize;
			height= (NBROWS+2*boardSpec.margins.y) * cellSize;
			
			/* useful ?
			var pieceCx=1.0*cx;			
			var pieceCy=pieceCx/1.0;
			if (pieceCy>pieceScale2D*cy){
				pieceCy=pieceScale2D*cy;
				pieceCx=this.g.pieceRatio*cy;
			}
			*/
			cSize={
				cx:cellSize,
				cy:cellSize,
				pieceCx:cellSize,
				pieceCy:cellSize,
				ratio: ratio,
				width: width,
				height: height,
			}
			CSIZES[boardSpec.margins.x+"_"+boardSpec.margins.y]=cSize;
		}
		return cSize;
	}
	
	View.Game.cbGridBoard = $.extend({},View.Game.cbBaseBoard,{
		
		notationMode: "out", // notation outside the board
		
		// 'this' is a Game object
		coordsFn: function(boardSpec) {
			
			boardSpec = boardSpec || {};
			boardSpec.margins = boardSpec.margins || {x:0,y:0};
			
			return function(pos) {
				var cSize = this.cbCSize(boardSpec);
				var c=pos%NBCOLS;
				var r=(pos-c)/NBCOLS;
				if(this.mViewAs==1)
					r=NBROWS-1-r;
				if(this.mViewAs==-1)
					c=NBCOLS-1-c;
				var coords={
					x:(c-(NBCOLS-1)/2)*cSize.cx,
					y:(r-(NBROWS-1)/2)*cSize.cy,
					z:0,
				};
				//console.warn("coord",pos,"=",coords)
				return coords;
			}
		},
		
		createGeometry: function(spec,callback) {
			var cSize = this.cbCSize(spec);
			var cx=cSize.width/1000;
			var cy=cSize.height/1000;
			var geo = new THREE.PlaneGeometry(cx,cy);
			
			var matrix = new THREE.Matrix4();
			matrix.makeRotationX(-Math.PI/2)
			geo.applyMatrix(matrix);
			
			var uvs=geo.faceVertexUvs[0];
			for (var u = 0 ; u < uvs.length ; u++){
				for (var i = 0 ; i < uvs[u].length ; i++){
					if(cSize.ratio<1)
						uvs[u][i].x=uvs[u][i].x*cSize.ratio+(1-cSize.ratio)/2;
					if(cSize.ratio>1)
						uvs[u][i].y=uvs[u][i].y/cSize.ratio+(1-1/cSize.ratio)/2;
				}
			}
			callback(geo);
		},

		paintBackground: function(spec,ctx,images,channel,bWidth,bHeight) {
			if (images['boardBG'])
				ctx.drawImage(images['boardBG'],-bWidth/2,-bHeight/2,bWidth,bHeight);				
		},		

		paintChannel: function(spec,ctx,images,channel) {
			var cSize = this.cbCSize(spec);
			spec.paintBackground.call(this,spec,ctx,images,channel,cSize.width,cSize.height);			
		},
		
		paint: function(spec,canvas,images,callback) {
			for(var channel in canvas) {
				var ctx=canvas[channel].getContext('2d');
				ctx.save();
				ctx.scale(spec.TEXTURE_CANVAS_CX/JOCLY_FIELD_SIZE,spec.TEXTURE_CANVAS_CY/JOCLY_FIELD_SIZE);
				ctx.translate(JOCLY_FIELD_SIZE/2,JOCLY_FIELD_SIZE/2);
				spec.paintChannel.call(this,spec,ctx,images,channel);
				ctx.restore();
			}
			callback();
		},


	});

	View.Game.cbGridBoardClassic = $.extend({},View.Game.cbGridBoard,{
		'colorFill' : {		
			".": "rgba(160,150,150,0.9)", // "white" cells
			"#": "rgba(0,0,0,1)", // "black" cells
			" ": "rgba(0,0,0,0)",
		},
		'texturesImg' : {
			'boardBG' : '/res/images/wood.jpg',
		},
		modifyMesh: function(spec,mesh,callback) {
			var cSize = this.cbCSize(spec);
			var cx=cSize.width/1000;
			var cy=cSize.height/1000;

			// add border frame
			function setupShapeSquare(cx,cy){
				var sh = new THREE.Shape();
				sh.moveTo(-cx/2 , -cy/2);
				sh.lineTo(cx/2 , -cy/2);
				sh.lineTo(cx/2 , cy/2);
				sh.lineTo(-cx/2 , cy/2);
				return sh;		
			}					
			var bevelSize = .1;
			var frameWidth=0.5;
			var frameShape = setupShapeSquare(cx+frameWidth+bevelSize, cy+frameWidth+bevelSize);
			var holeShape = setupShapeSquare(cx+bevelSize,cy+bevelSize);
			frameShape.holes.push(holeShape);

			var extrudeSettings = {
				amount: .4 , // main extrusion thickness
				steps: 1 , // nb of main extrusion steps
				bevelSize: bevelSize, 
				bevelThickness:.04,
				bevelSegments: 1, // nb of bevel segment
			};

			var frameGeo = new THREE.ExtrudeGeometry( frameShape, extrudeSettings );
			
			var matrix = new THREE.Matrix4();
			matrix.makeRotationX(-Math.PI/2)
			frameGeo.applyMatrix(matrix);
			
			blackMat = new THREE.MeshPhongMaterial({
				color: '#000000',
				shininess: 500,
				specular: '#888888',
				emissive: '#000000',
				//ambient: '#000000',
			});
			var frameObj = new THREE.Mesh( frameGeo , blackMat);
			frameObj.position.y=-extrudeSettings.amount-.01;
			mesh.add(frameObj);
			var bottom = new THREE.Mesh(new THREE.BoxGeometry(cx,cy,0.1),blackMat);
			bottom.rotation.x=Math.PI/2;
			bottom.position.y=-.1;
			mesh.add(bottom);
			callback(mesh);
		},
		
		paintCell: function(spec,ctx,images,channel,cellType,xCenter,yCenter,cx,cy) {
			ctx.strokeStyle = "rgba(0,0,0,1)";
			ctx.lineWidth = 15;
			if (channel=='bump')
				ctx.fillStyle="#ffffff";
			else
				ctx.fillStyle=spec.colorFill[cellType];
			ctx.fillRect(xCenter-cx/2,yCenter-cy/2,cx,cy);
			ctx.rect(xCenter-cx/2,yCenter-cy/2,cx,cy);
		},
		
		paintCells: function(spec,ctx,images,channel) {
			var cSize = this.cbCSize(spec);
			var getCoords=spec.coordsFn(spec);
			for(var row=0;row<NBROWS;row++) {
				for(var col=0;col<NBCOLS;col++) {
					var pos = this.mViewAs==1 ?
						col+row*NBCOLS :
						NBCOLS*NBROWS-(1+col+row*NBCOLS);
					var coords=getCoords.call(this,pos);
					var cellType=this.cbView.boardLayout[NBROWS-row-1][col];
					var xCenter=coords.x;
					var yCenter=coords.y;
					var cx=cSize.cx;
					var cy=cSize.cy;
					
					spec.paintCell.call(this,spec,ctx,images,channel,cellType,xCenter,yCenter,cx,cy);
				}
			}
		},
		
		paintLines: function(spec,ctx,images,channel) {
			var cSize = this.cbCSize(spec);
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 40;
			ctx.strokeRect(-NBCOLS*cSize.cx/2,-NBROWS*cSize.cy/2,NBCOLS*cSize.cx,NBROWS*cSize.cy);
		},

		paintChannel: function(spec,ctx,images,channel) {
			var cSize = this.cbCSize(spec);
			spec.paintBackground.call(this,spec,ctx,images,channel,cSize.width,cSize.height);
			spec.paintCells.call(this,spec,ctx,images,channel)
			spec.paintLines.call(this,spec,ctx,images,channel);
			if(this.mNotation)
				spec.paintNotation.call(this,spec,ctx,channel);
		},
		
		paintNotation: function(spec,ctx,channel) {
			var cSize = this.cbCSize(spec);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = "#000000";
			ctx.font = Math.ceil(cSize.cx / 3) + 'px Monospace';
			switch(spec.notationMode) {
			case "out":
				spec.paintOutNotation.apply(this,arguments);
				break;
			case "in":
				spec.paintInNotation.apply(this,arguments);
				break;
			}
		},
		
		paintOutNotation: function(spec,ctx,channel) {
			var cSize = this.cbCSize(spec);
			for (var row = 0; row < NBROWS; row++) {
				var displayedRow = NBROWS - row;
				if(this.mViewAs<0)
					displayedRow=row+1;
				var x = -(NBCOLS/2 + spec.margins.x/2) * cSize.cx;
				var y = (row-NBROWS/2+.5) * cSize.cy;
				ctx.fillText(displayedRow, x, y);	
			}
			for (var col = 0; col < NBCOLS; col++) {
				var displayedCol=col;
				if(this.mViewAs<0)
					displayedCol = NBCOLS - col -1;
				var x = (col-NBCOLS/2+.5) * cSize.cx;
				var y = (NBROWS/2 + spec.margins.y/2) * cSize.cy;
				ctx.fillText(String.fromCharCode(97 + displayedCol), x , y);
			}
		},
		
		paintInNotation: function(spec,ctx,channel) {
			var cSize = this.cbCSize(spec);
			var getCoords=spec.coordsFn(spec);
			var fills=spec.colorFill;
			ctx.font = Math.ceil(cSize.cx / 5) + 'px Monospace';
			for (var row = 0; row < NBROWS; row++) {
				for (var col = 0; col < NBCOLS; col++) {
					var displayedRow=NBROWS - row;
					var displayedCol=col;
					if(this.mViewAs<0)
						displayedCol = NBCOLS - col -1;
					else
						displayedRow=row+1;								
					var pos = this.mViewAs==1 ?
							col+row*NBCOLS :
							NBCOLS*NBROWS-(1+col+row*NBCOLS);
					var coords=getCoords.call(this,pos);
					ctx.fillStyle="rgba(0,0,0,0)";
					if(channel=="bump")
						ctx.fillStyle = fills["."];
					switch(this.cbView.boardLayout[NBROWS-row-1][col]) {
					case ".":
						ctx.fillStyle= (channel=="bump") ? fills["."] : fills["#"];
						break;
					case "#":
						ctx.fillStyle=fills["."];
						break;
					}
					var x = coords.x-cSize.cx / 3;
					var y = coords.y-cSize.cy / 3;
					if(spec.notationDebug)
						ctx.fillText(pos,x,y);
					else
						ctx.fillText(String.fromCharCode(97 + displayedCol) + displayedRow,x,y);
				}
			}
		},
	});
	
	View.Board.cbMoveMidZ = function(aGame,aMove,zFrom,zTo) {
		var geometry = aGame.cbVar.geometry;
		var x0 = geometry.C(aMove.f);
		var x1 = geometry.C(aMove.t);
		var y0 = geometry.R(aMove.f);
		var y1 = geometry.R(aMove.t);
		if(x1-x0==0 || y1-y0==0 || Math.abs(x1-x0)==Math.abs(y1-y0))
			return (zFrom+zTo)/2;
		else
			return Math.max(zFrom,zTo)+1500;
	}

	View.Game.cbGridBoardClassic2D = $.extend({},View.Game.cbGridBoardClassic,{
		'colorFill' : {		
			".": "#F1D9B3", // "white" cells
			"#": "#C7885D", // "black" cells
			" ": "rgba(0,0,0,0)",
		},
	});

	View.Game.cbGridBoardClassic3DMargin = $.extend({},View.Game.cbGridBoardClassic,{
		'margins' : {x:.67,y:.67},
		'extraChannels':[ // in addition to 'diffuse' which is default
			'bump'
		],
		/*
		'mesh': { // not implemented yet
			jsfile:"/res/xd-view/meshes/taflboard.js",
			meshScale:1.32,
			boardMaterialName:"board",
		}
		*/
	});
	
	View.Game.cbGridBoardClassic2DMargin = $.extend({},View.Game.cbGridBoardClassic2D,{
		'margins' : {x:.67,y:.67},
	});

	View.Game.cbGridBoardClassic2DNoMargin = $.extend({},View.Game.cbGridBoardClassic2D,{
		'margins' : {x:0.0,y:0.0},
		'notationMode': 'in',
		'texturesImg' : {
			'boardBG' : '/res/images/whitebg.png',
		},
	});

	
	
})();

(function() {
	var CANVAS_SIZE = 512;
	var FAIRY_CANVAS_PROPERTIES = {
			cx: CANVAS_SIZE,
			cy: CANVAS_SIZE
	}
	function THREE_CONST(v) {
		if(typeof THREE!=="undefined")
			return THREE[v];
		else
			return 0;
	}

	View.Game.cbFairyPieceStyle = function(modifier) {
		return $.extend(true,{
			"1": {
				"default": {
					"2d": {
						clipy: 0,
					},
				},
			},
			"-1": {
				"default": {
					"2d": {
						clipy: 100,
					},
				},
			},
			"default": {
				"3d": {
					display: this.cbDisplayPieceFn(this.cbFairyPieceStyle3D),
				},
				"2d": {
					file: this.mViewOptions.fullPath + "/res/fairy/wikipedia-fairy-sprites.png",
					clipwidth: 100,
					clipheight: 100,
				},
			},
			"fr-pawn": {
				"2d": {
					clipx: 0,
				},
			},
			"fr-knight": {
				"2d": {
					clipx: 100,
				},
			},
			"fr-bishop": {
				"2d": {
					clipx: 200,
				},
			},
			"fr-rook": {
				"2d": {
					clipx: 300,
				},
			},
			"fr-queen": {
				"2d": {
					clipx: 400,
				},
			},
			"fr-king": {
				"2d": {
					clipx: 500,
				},
			},
			"fr-cannon": {
				"2d": {
					clipx: 600,
				},
			},
			"fr-cannon2": {
				"2d": {
					clipx: 600,
				},
			},
			"fr-elephant": {
				"2d": {
					clipx: 700,
				},
			},
			"fr-dragon": {
				"2d": {
					clipx: 800,
				},
			},
			"fr-lighthouse": {
				"2d": {
					clipx: 900,
				},
			},
			"fr-admiral": {
				"2d": {
					clipx: 1000,
				},
			},
			"fr-eagle": {
				"2d": {
					clipx: 1100,
				},
			},
			"fr-lion": {
				"2d": {
					clipx: 1200,
				},
			},
			"fr-camel": {
				"2d": {
					clipx: 1300,
				},
			},
			"fr-amazon": {
				"2d": {
					clipx: 1400,
				},
			},
			"fr-crowned-rook": {
				"2d": {
					clipx: 1500,
				},
			},
			"fr-marshall": {
				"2d": {
					clipx: 1600,
				},
			},
			"fr-cardinal": {
				"2d": {
					clipx: 1700,
				},
			},
			"fr-unicorn": {
				"2d": {
					clipx: 1800,
				},
			},
		},modifier);
	}
	
	View.Game.cbFairyPieceStyle3D = $.extend(true,{},View.Game.cbUniformPieceStyle3D,{
		
		"default": {
			mesh: {
				normalScale: 1,
				rotateZ: 180,
			},
			//'useUniforms' : true,
			materials:{
				mat0:{						
					channels:{ 
						diffuse:{
							size: FAIRY_CANVAS_PROPERTIES, 
						},
						normal: { 
							size: FAIRY_CANVAS_PROPERTIES,
						},
					},
				},
			},	
		},

		"1":{
			'default': {
				materials:{
					mat0:{						
						params : {
							specular: 0x020202,
							shininess : 150 , 
						},
					},
				},
			}
		},
		"-1":{
			'default': {
				materials:{
					mat0:{						
						params : {
							specular: 0x040404,
							shininess : 100 , 
						},
					},
				},
				paintTextureImageClip: function(spec,ctx,material,channel,channelData,imgKey,image,clip,resources) {
					var cx=ctx.canvas.width;
					var cy=ctx.canvas.height;
					if(channel=="diffuse") {
						ctx.globalCompositeOperation = 'normal';
						ctx.drawImage(image,clip.x,clip.y,clip.cx,clip.cy,0,0,cx,cy);
						ctx.globalCompositeOperation = 'multiply';
						ctx.drawImage(image,clip.x,clip.y,clip.cx,clip.cy,0,0,cx,cy);
						ctx.drawImage(image,clip.x,clip.y,clip.cx,clip.cy,0,0,cx,cy);
						ctx.globalCompositeOperation = 'hue';
						ctx.fillStyle='rgba(0,0,0,0.7)';
						ctx.fillRect(0,0,CANVAS_SIZE,CANVAS_SIZE);
					} else
						ctx.drawImage(image,clip.x,clip.y,clip.cx,clip.cy,0,0,cx,cy);
				},
			},
		},

		
		"fr-pawn": {
			mesh: { 
				jsFile:"/res/fairy/pawn/pawn.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/pawn/pawn-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/pawn/pawn-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-knight": {
			mesh: { 
				jsFile:"/res/fairy/knight/knight.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/knight/knight-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/knight/knight-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-bishop": {
			mesh: { 
				jsFile:"/res/fairy/bishop/bishop.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/bishop/bishop-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/bishop/bishop-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-rook": {
			mesh: { 
				jsFile:"/res/fairy/rook/rook.js" 		
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/rook/rook-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/rook/rook-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-queen": {
			mesh: { 
				jsFile:"/res/fairy/queen/queen.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/queen/queen-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/queen/queen-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-king": {
			mesh: { 
				jsFile:"/res/fairy/king/king.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/king/king-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/king/king-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-cannon": {
			mesh: { 
				jsFile:"/res/fairy/cannon/cannon.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/cannon/cannon-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/cannon/cannon-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-cannon2": {
			mesh: { 
				jsFile:"/res/fairy/cannon2/cannon2.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/cannon2/cannon2-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/cannon2/cannon2-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-dragon": {
			mesh: { 
				jsFile:"/res/fairy/dragon/dragon.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/dragon/dragon-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/dragon/dragon-normalmap.jpg", 
							}
						}
					}
				}
			},
		},

		"fr-lighthouse": {
			mesh: { 
				jsFile:"/res/fairy/lighthouse/lighthouse.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/lighthouse/lighthouse-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/lighthouse/lighthouse-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-elephant": {
			mesh: { 
				jsFile:"/res/fairy/elephant/elephant.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/elephant/elephant-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/elephant/elephant-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-admiral": {
			mesh: { 
				jsFile:"/res/fairy/admiral/admiral.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/admiral/admiral-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/admiral/admiral-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-eagle": {
			mesh: { 
				jsFile:"/res/fairy/eagle/eagle.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/eagle/eagle-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/eagle/eagle-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-lion": {
			mesh: { 
				jsFile:"/res/fairy/lion/lion.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/lion/lion-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/lion/lion-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-camel": {
			mesh: { 
				jsFile:"/res/fairy/camel/camel.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/camel/camel-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/camel/camel-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-marshall": {
			mesh: { 
				jsFile:"/res/fairy/marshall/marshall.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/marshall/marshall-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/marshall/marshall-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-crowned-rook": {
			mesh: { 
				jsFile:"/res/fairy/crowned-rook/crowned-rook.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/crowned-rook/crowned-rook-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/crowned-rook/crowned-rook-normalmap.jpg", 
							}
						}
					}
				}
			},
		},

		"fr-amazon": {
			mesh: { 
				jsFile:"/res/fairy/amazon/amazon.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/amazon/amazon-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/amazon/amazon-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-cardinal": {
			mesh: { 
				jsFile:"/res/fairy/cardinal/cardinal.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/cardinal/cardinal-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/cardinal/cardinal-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
		
		"fr-unicorn": {
			mesh: { 
				jsFile:"/res/fairy/unicorn/unicorn.js" 
			},
			materials: {
				mat0: {
					channels: {
						diffuse: {
							texturesImg: {
								diffImg : "/res/fairy/unicorn/unicorn-diffusemap.jpg",
							}
						},
						normal: {
							texturesImg: {
								normalImg: "/res/fairy/unicorn/unicorn-normalmap.jpg", 
							}
						}
					}
				}
			},
		},
	});
	
})();
/*
 * Copyright(c) 2013-2014 - jocly.com
 *
 * You are allowed to use and modify this source code as long as it is exclusively for use in the Jocly API. 
 *
 * Original authors: Jocly team
 *
 */
 

(function() {
	
	View.Game.cbDefineView = function() {

		var capaBoardDelta = {
			notationMode: 'in',
			notationDebug: true,
		};		
		var capaBoard3d = $.extend(true,{},this.cbGridBoardClassic3DMargin,capaBoardDelta);
		var capaBoard2d = $.extend(true,{},this.cbGridBoardClassic2DNoMargin,capaBoardDelta);
		
		return {
			coords: {
				"2d": this.cbGridBoard.coordsFn.call(this,capaBoard2d),
				"3d": this.cbGridBoard.coordsFn.call(this,capaBoard3d),
			},
			boardLayout: [
	      		".#.#.#.#.#",
	     		"#.#.#.#.#.",
	      		".#.#.#.#.#",
	     		"#.#.#.#.#.",
	      		".#.#.#.#.#",
	     		"#.#.#.#.#.",
	      		".#.#.#.#.#",
	     		"#.#.#.#.#.",
	      		],
			board: {
				"2d": {
					draw: this.cbDrawBoardFn(capaBoard2d),										
				},
				"3d": {
					display: this.cbDisplayBoardFn(capaBoard3d),					
				},
			},
			clicker: {
				"2d": {
					width: 1100,
					height: 1100,
				},
				"3d": {
					scale: [.75,.75,.75],
				},
			},
			pieces: this.cbFairyPieceStyle({
				"default": {
					"3d": {
						scale: [.5,.5,.5],
					},
				},
			}),
		};
	}

	/* Make the knight, chancellor and archbishop jump when leaping */
	View.Board.cbMoveMidZ = function(aGame,aMove,zFrom,zTo) {
	var geometry = aGame.cbVar.geometry;
	var x0 = geometry.C(aMove.f);
	var x1 = geometry.C(aMove.t);
	var y0 = geometry.R(aMove.f);
	var y1 = geometry.R(aMove.t);
	if(x1-x0==0 || y1-y0==0 || Math.abs(x1-x0)==Math.abs(y1-y0))
		return (zFrom+zTo)/2;
	else
		return Math.max(zFrom,zTo)+1500;
}


})();

//# sourceMappingURL=carrera-chess-view.js.map