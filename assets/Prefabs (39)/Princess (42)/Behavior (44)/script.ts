Sup.ArcadePhysics2D.setGravity(0, -0.02);

class PrincessBehavior extends Sup.Behavior {
  speed = 0.06;
  jumpSpeed = 0.8;
  wallHugResistance = 1.15;
  wallJumpSpeed = 25;
  clone = null;
  position: Sup.Math.Vector3 = this.actor.getLocalPosition();
  doubleJump = false;
  airTime = 60;
  wallJumped = false;
  mapDefaults: Sup.Actor[];
  active:boolean = true;

  runSoundPlayer:Sup.Audio.SoundPlayer = Sup.Audio.playSound("Sound/RunningSound",0,{'loop':true});

  mapDefaultBodies: Sup.ArcadePhysics2D.Body[] = [];
  map_1_Bodies: Sup.ArcadePhysics2D.Body[] = [];
  platformsBodies: Sup.ArcadePhysics2D.Body[] = [];
  switchBodies : Sup.ArcadePhysics2D.Body[] = [];
  gateBodies : Sup.ArcadePhysics2D.Body[] = [];
  portalBodies : Sup.ArcadePhysics2D.Body[] = [];
  hazardBodies : Sup.ArcadePhysics2D.Body[] = [];

  awake() {
    Game.playerBehavior = this;
    this.mapDefaults = Sup.getActor("Map").getChildren();
  }

  handleCollisions()
  {

    
    for(let mapDefault of this.mapDefaults) this.mapDefaultBodies.push(mapDefault.arcadeBody2D);
    
    if (Game.color == 1){
      if (Sup.getActor("Map_Green")){
        let mapGreenDefaults = Sup.getActor("Map_Green").getChildren();
        for(let mapGreenDefault of mapGreenDefaults) this.mapDefaultBodies.push(mapGreenDefault.arcadeBody2D);
      }
    }
    
    if (Game.color == 2){
      if (Sup.getActor("Map_Orange")){
        let mapOrangeDefaults = Sup.getActor("Map_Orange").getChildren();
        for(let mapOrangeDefault of mapOrangeDefaults) this.mapDefaultBodies.push(mapOrangeDefault.arcadeBody2D);
      }
    }
    
    Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D,this.mapDefaultBodies);
  }
  
  handleHazards() 
  {
    if (Sup.getActor("Hazards")){
      let hazardDefaults = Sup.getActor("Hazards").getChildren();
      for(let hazardDefault of hazardDefaults) this.hazardBodies.push(hazardDefault.arcadeBody2D);
    }
    
    Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D,this.hazardBodies);
    let t = this.actor.arcadeBody2D.getTouches();
    if (t.left || t.right || t.top || t.bottom){
      this.runSoundPlayer.stop();
      Game.reloadLevel();
    }
  }

  handlePortals() 
  {
    if (Sup.getActor("Portals")){
      let portalDefaults = Sup.getActor("Portals").getChildren();
      for(let portalDefault of portalDefaults) this.portalBodies.push(portalDefault.arcadeBody2D);
    }
    
    Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D,this.portalBodies);
    let t = this.actor.arcadeBody2D.getTouches();
    if (t.left || t.right || t.top || t.bottom){
      this.runSoundPlayer.stop();
      Game.loadNextLevel();
    }
  }

  handleSwitches() 
  {

    //initiate the objects in Switch and Gate
    if (Sup.getActor("Switch")){
      let switchDefaults = Sup.getActor("Switch").getChildren();
      for(let switchDefault of switchDefaults) this.switchBodies.push(switchDefault.arcadeBody2D);
    }
    
    if (Sup.getActor("Gate")){
      let gateDefaults = Sup.getActor("Gate").getChildren();
      for(let gateDefault of gateDefaults)this.gateBodies.push(gateDefault.arcadeBody2D);
    }
    
    //for slpicing the bodies
    var i = 0 , j = 0;
    
    //find the values that the charcter is on to
    for(let switchn of this.switchBodies)
    {
      //define some varibles
      var a = (Math.abs((switchn.actor.getLocalPosition().x -this.actor.getLocalPosition().x-6.8))<2);
      var b = ((switchn.actor.getLocalPosition().y -this.actor.getLocalPosition().y+6.8)>-1);
      //if bothare truw for x and y axis
      if(a&&b)
        {
          //loops though the same gate that corrosponds to the switch
          for(let aGate of this.gateBodies)
            {
              //gets rif of the two same
              if(aGate.actor['__inner'].name === switchn.actor['__inner'].name)
                {
                  this.gateBodies.splice(j--,1);
                  this.switchBodies.splice(i--,1);
                }
              j++
            }
        }
      i++;
    }
    //push whatever is left
  for(var i = 0;i< this.gateBodies.length;i++)
    {
      this.mapDefaultBodies.push(this.gateBodies[i]);
    }
  }

  handleAfterCollisions(velocity) {
    //returns whether we are touching the bottom of a special collision
    
    let touchingBottom = false;
    
    if (Sup.getActor("Platforms")){
      let platformDefaults = Sup.getActor("Platforms").getChildren();
      for(let platformDefault of platformDefaults){
        Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D,[platformDefault.arcadeBody2D]);
        let touchBottom = this.actor.arcadeBody2D.getTouches().bottom;
         touchingBottom = touchingBottom || touchBottom;

        if (touchBottom){
          this.actor.arcadeBody2D.warpPosition(this.actor.getLocalPosition().add(platformDefault.arcadeBody2D.getVelocity().x,platformDefault.arcadeBody2D.getVelocity().y,0));
          velocity.y = -0.01;
        }      
      } 
    }
    return touchingBottom;
  }
    initializeArrays()
    {
        this.switchBodies = [];
       this.gateBodies = [];
       this.mapDefaultBodies = [];
       this.map_1_Bodies = [];
       this.platformsBodies = [];

    }
    update() 
    {
    this.initializeArrays();
    this.handlePortals();
    this.handleHazards();
    this.handleSwitches();
    this.handleCollisions();
    

    for (var i = 0; i < this.mapDefaultBodies.length;i++)
      {
        //Sup.log(this.mapDefaultBodies.length);
      }
    let touchBottom = this.actor.arcadeBody2D.getTouches().bottom;
    let touchRight = this.actor.arcadeBody2D.getTouches().right;
    let touchLeft = this.actor.arcadeBody2D.getTouches().left;
      
    if (touchBottom){
      this.wallJumped = false;
    }
    
    // As explained above, we get the current velocity
    let velocity = this.actor.arcadeBody2D.getVelocity();

      
    // We override the `.x` component based on the player's input
    if (Sup.Input.isKeyDown("LEFT")) {
      velocity.x -= this.speed;
      // When going left, we flip the sprite
      this.actor.spriteRenderer.setHorizontalFlip(false);
    } else if (Sup.Input.isKeyDown("RIGHT")) {
      velocity.x += this.speed;
      // When going right, we clear the flip
      this.actor.spriteRenderer.setHorizontalFlip(true);
    }
      
    if (Sup.Input.isKeyDown("Q")) {
      Game.color = 0;
    } else if (Sup.Input.isKeyDown("W")) {
      Game.color = 1;
    } else if (Sup.Input.isKeyDown("E")) {
      Game.color = 2;
    }

    if (Game.debug) {
      if (Sup.Input.wasKeyJustPressed("ADD")) {
        this.runSoundPlayer.stop();
        Game.loadNextLevel();
      }
      
      if (Sup.Input.wasKeyJustPressed("SUBTRACT")) {
        this.runSoundPlayer.stop();
        Game.loadPrevLevel();
      }
    }
      
    velocity.x /= 1.1;
    if (Math.abs(velocity.x) < 0.05){
      velocity.x = 0;
    }

    //varible needed for double jump validation
    if (Sup.Input.isKeyDown("SPACE") &&  !this.doubleJump) 
    {
      if(!Game.cloneExists)
        {
        //this.statue.destroy();  
        this.doubleJump = true;
        //add base
        Game.cloneExists = true;
        this.clone = Sup.appendScene("Prefabs/Princess/PrincessPrefab")[0];
        Sup.log(this.clone);
        this.clone.arcadeBody2D.warpPosition(this.actor.getLocalPosition());
        
        if (!touchBottom){
          this.actor.arcadeBody2D.warpPosition(this.actor.getLocalPosition().add(new Sup.Math.Vector3(0,this.actor.arcadeBody2D.getSize()['height'],0)));
          velocity.y = this.jumpSpeed;
          this.actor.spriteRenderer.setAnimation("Jump");
        }
      }
    }
      
    touchBottom = touchBottom || this.handleAfterCollisions(velocity);
    
    if (touchBottom) {
      this.doubleJump = false;
      if (Sup.Input.wasKeyJustPressed("UP")) {
        velocity.y = this.jumpSpeed;
        Sup.Audio.playSound("Sound/JumpSound" + Sup.Math.Random.integer(1,2));
        this.actor.spriteRenderer.setAnimation("Jump");
      } else {
        // Here, we should play either "Idle" or "Run" depending on the horizontal speed
        if (velocity.x === 0) this.actor.spriteRenderer.setAnimation("Idle");
        else this.actor.spriteRenderer.setAnimation("Run");
      }
    } else {
      // Here, we should play either "Jump" or "Fall" depending on the vertical speed
      if (velocity.y >= 0) {
        if (this.wallJumped){
          
        }else{
          this.actor.spriteRenderer.setAnimation("Jump");
        }
      } else {
        if (touchLeft || touchRight){
          velocity.y /= this.wallHugResistance;
          this.actor.spriteRenderer.setAnimation("WallHug");
        }else{
          this.actor.spriteRenderer.setAnimation("Fall");
        }
      }
      
      if (Sup.Input.wasKeyJustPressed("UP") && touchLeft) {
        velocity.y = this.jumpSpeed*2/3;
        velocity.x = this.speed * this.wallJumpSpeed + 0.5;
        this.actor.spriteRenderer.setAnimation("WallJump");
        this.wallJumped = true;
      } else if (Sup.Input.wasKeyJustPressed("UP") && touchRight) {
        velocity.y = this.jumpSpeed*2/3;
        velocity.x = -(this.speed * this.wallJumpSpeed + 0.5);
        this.actor.spriteRenderer.setAnimation("WallJump");
        this.wallJumped = true;
      }
    }
    
    if (Math.abs(velocity.x) > 0 && touchBottom){
      this.runSoundPlayer.setVolume(1);
    }else{
      this.runSoundPlayer.setVolume(0);
    }
      
    this.position = this.actor.getLocalPosition();
      
    // Finally, we apply the velocity back to the ArcadePhysics body
    this.actor.arcadeBody2D.setVelocity(velocity);
  }
}

Sup.registerBehavior(PrincessBehavior);