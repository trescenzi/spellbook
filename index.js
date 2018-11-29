function clear(elem) {
  while(elem.firstChild){
    elem.removeChild(elem.firstChild);
  }
}

const spellTemplate = `
<details>
  <summary>Name</summary>
  <table>
    <tr>
      <td>Casting Time</td>
      <td></td>
    </tr>
    <tr>
      <td>Range</td>
      <td></td>
    </tr>
    <tr>
      <td>Components</td>
      <td></td>
    </tr>
    <tr>
      <td>Duration</td>
      <td></td>
    </tr>
  </table>
  <details class="description">
    <summary>Spell Description</summary>
    <div></div>
  </details>
</details>
`;

class Spell extends HTMLElement {
  static get observedAttributes() {
    return ['spell'];
  }

  constructor() {
    super();
    const range = document.createRange();
    this.template = range.createContextualFragment(spellTemplate);
  }

  connectedCallback() {
    if (!this.hasBeenConnected) {
      this.append(this.template);
      this._name = this.querySelector('summary');
      [
        this._castingTime,
        this._range,
        this._components,
        this._duration,
      ] = this.querySelectorAll('td:nth-of-type(2)');
      this._description = this.querySelector('details div');
      this.hasBeenConnected = true;
    }
  }

  attributeChangedCallback(name, old, val) {
    if (name === 'spell') {
      try {
        this.spell = JSON.parse(val);
      } catch(e) {
        console.log('FAILED TO PARSE SPELL DATA:');
        console.log(val);
        console.log(e);
      }
    }
  }

  set spell(data) {
    this._data = data;
    console.log(this._castingTime);
    Object.keys(data).forEach(key => {
      try {
        this[`_${key}`].textContent = data[key]
      } catch(e) { 
        console.log('Spell doesnt display', key);
      }
    });
  }

  get spell() {
    return this._data;
  }
}

class SpellLevel extends HTMLElement {
  static get observedAttributes() {
    return ['spells', 'level'];
  }

  attributeChangedCallback(name, old, val) {
    if (name === 'spells') {
      try {
        this.spells = JSON.parse(val);
      } catch(e) {
        console.log('FAILED TO PARSE SPELL LEVEL DATA:');
        console.log(val);
        console.log(e);
      }
    }

    if (name === 'level') {
      this._summary.textContent = `Level ${val}`;
    }
  }

  connectedCallback() {
    if (!this.hasBeenConnected) {
      this._details = document.createElement('details');
      this._summary = document.createElement('summary');
      this._body = document.createElement('div');
      this._details.append(this._summary);
      this._details.append(this._body);
      this.append(this._details);
      this.hasBeenConnected = true;
    }
  }

  set spells(data) {
    this._spells = data;
    clear(this._body);
    data.map((spell) => {
      const spellEl = new Spell();
      this._body.append(spellEl);
      spellEl.spell = spell;
    })
  }
}

class SpellList extends HTMLElement {
  static get observedAttributes() {
    return ['spells'];
  }

  attributeChangedCallback(name, old, val) {
    if (name === 'spells') {
      try {
        this.spells = JSON.parse(val);
      } catch(e) {
        console.log('FAILED TO PARSE SPELL LIST DATA:');
        console.log(val);
        console.log(e);
      }
    }
  }

  set spells(data) {
    this._spells = data;
    clear(this);
    data.forEach((spells, i) => {
      const level = new SpellLevel();
      this.append(level);
      level.setAttribute('level', i);
      level.spells = spells;
    });
  }

  get spells() {
    return this._spells;
  }
}

customElements.define('x-spell-list', SpellList);
customElements.define('x-spell-level', SpellLevel);
customElements.define('x-spell', Spell);
