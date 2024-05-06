import { TPO } from "./config.mjs";

export default function () {
  
  TokenHUD.prototype._onToggleEffect = function (event, { overlay = false } = {}) {
    event.preventDefault();
    event.stopPropagation();
    let img = event.currentTarget;
    const effect = (img.dataset.statusId && this.object.actor) ?
      CONFIG.statusEffects.find(e => e.id === img.dataset.statusId) :
      img.getAttribute("src");

    console.log(effect)

    if (event.button == 0)
      return this.object.incrementCondition(effect)
    if (event.button == 2)
      return this.object.decrementCondition(effect)
  }

  Token.prototype.incrementCondition = async function (effect, { active, overlay = false } = {}) {
    console.log('up')
    const existing = this.actor.effects.find(e => [...e.statuses][0] == effect.id);
    console.log(effect.id)
    console.log(Number.isNumeric(getProperty(existing, "flags.tpo.rating")))
    if (!existing || Number.isNumeric(getProperty(existing, "flags.tpo.rating")))
      await this.actor.addStatus(effect.id)
    else if (existing) // Not numeric, toggle if existing
      await this.actor.removeStatus(effect.id)

    // Update the Token HUD
    if (this.hasActiveHUD) canvas.tokens.hud.refreshStatusIcons();
    return active;
  }

  Token.prototype.decrementCondition = async function (effect, { active, overlay = false } = {}) {
    console.log('down')
    console.log(effect)
    await this.actor.removeStatus(effect.id)

    // Update the Token HUD
    if (this.hasActiveHUD) canvas.tokens.hud.refreshStatusIcons();
    return active;
  }

  Token.prototype.drawEffects = async function() 
  {
    console.log('drawingeffect')
    const wasVisible = this.effects.visible;
    this.effects.visible = false;
    this.effects.removeChildren().forEach(c => c.destroy());
    this.effects.bg = this.effects.addChild(new PIXI.Graphics());
    this.effects.bg.visible = false;
    this.effects.overlay = null;

    // Categorize new effects
    const tokenEffects = this.document.effects;
    const actorEffects = this.actor?.temporaryEffects || [];
    let overlay = {
      src: this.document.overlayEffect,
      tint: null
    };

    // Draw status effects
    if ( tokenEffects.length || actorEffects.length ) {
      const promises = [];

      // Draw actor effects first
      for ( let f of actorEffects ) {
        if ( !f.icon ) continue;
        const tint = Color.from(f.tint ?? null);
        if ( f.getFlag("core", "overlay") ) {
          if ( overlay ) promises.push(this._drawEffect(overlay.src, overlay.tint));
          overlay = {src: f.icon, tint};
          continue;
        }
        promises.push(this._drawEffect(f.icon, tint,  getProperty(f, "flags.tpo.rating")));
      }

      // Next draw token effects
      for ( let f of tokenEffects ) promises.push(this._drawEffect(f, null));
      await Promise.all(promises);
    }

    // Draw overlay effect
    this.effects.overlay = await this._drawOverlay(overlay.src, overlay.tint);
    this.effects.bg.visible = true;
    this.effects.visible = wasVisible;
    this._refreshEffects();
  }

  Token.prototype._drawEffect = async function(src, tint, rating) {
    if ( !src ) return;
    let tex = await loadTexture(src, {fallback: "icons/svg/hazard.svg"});
    let icon = new PIXI.Sprite(tex);
    if ( tint ) icon.tint = tint;

    // Add TPO Counter
    if(rating){
      let text = new PreciseText(rating, TPO.effectTextStyle)
      text.x = icon.x + icon.width * 0.1;
      text.y = icon.y + icon.height * 0.05;
      text.scale.x = 7;
      text.scale.y = 7;
      icon.addChild(text)
    }
    
    return this.effects.addChild(icon);
  }

}