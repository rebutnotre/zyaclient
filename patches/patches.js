import assets from '../assets.js';
import ModUtils from '../modUtils.js';

export default (/** @type {ModUtils} */ modUtils) => {
    const { insertCode, waitForMinification } = modUtils

    // Render win count
    insertCode(`var s = Math.floor((Device.a1.largeUIEnabled() ? 0.018 : 0.0137) * h___.hz);
		ctx.font = Util.qd.sS(0, Math.max(5, s));
		Util.qd.textBaseline(ctx, 0);
		Util.qd.textAlign(ctx, 2);
		ctx.fillStyle = Colors.nl;
		ctx.fillText(clientInfo.gameVersion, h___.w, 0);
        /* here */`,
        `const text = "Win count: " + __fx.wins.count;
        const textLength = ctx.measureText(text).width;
        const size = Math.max(5, s);
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, ctx.canvas.width - textLength - size / 2, size * 2);`)

    // Make the main canvas context have an alpha channel if a custom background is being used
    insertCode(`mainCanvasElement = document.getElementById("canvasA");
		if (Device.id === 2) { mainCanvasElement.style.webkitUserSelect = "none"; }
		mainCanvas = mainCanvasElement.getContext("2d", { alpha: /* here */ false });`,
    `__fx.makeMainMenuTransparent ? true :`)

	// Reset donation history and leaderboard filter when a new game is started
	insertCode(`an.init();ai.a5l();bA.pQ.qC = [];bA.hZ.pT = 1;/* here */`,
	`__fx.donationsTracker.reset(), __fx.leaderboardFilter.reset(), __fx.customLobby.isActive() && __fx.customLobby.hideWindow(), __fx.trainer?.onGameInit(), __fx.restartGame = () => aE.a5i(), window.aE = aE, window.__fx_replayPhase = 0;`);

    waitForMinification(() => applyPatches(modUtils))
}
//export const requiredVariables = ["game", "playerId", "playerData", "rawPlayerNames", "gIsSingleplayer", "playerTerritories"];

function applyPatches(/** @type {ModUtils} */ { replace, replaceOne, replaceRawCode, safeDictionary, matchOne, matchRawCode, escapeRegExp }) {

    // Constants for easy usage of otherwise long variable access expressions
    const dict = safeDictionary;
    const playerId = `${dict.game}.${dict.playerId}`;
    const rawPlayerNames = `${dict.playerData}.${dict.rawPlayerNames}`;
    const gIsSingleplayer = `${dict.game}.${dict.gIsSingleplayer}`;

    // Make tick interval configurable for slow-motion micro mode
    replaceRawCode(`bh.eW>=eW&&(eW+=bh.aCY*Math.floor(1+(bh.eW-eW)/bh.aCY)`,
        `bh.eW>=eW&&(eW+=(window.__fx_aCY??bh.aCY)*Math.floor(1+(bh.eW-eW)/(window.__fx_aCY??bh.aCY))`);

    // Expose aTO globally so __fx.selectMap can refresh the map UI before game init
    replaceRawCode(`function aTO(){aTR(),aTP()}`,
        `function aTO(){aTR(),aTP()}window.__fx_aTO=aTO;`);

    // Hook a66 (resets aD.data when opening custom scenario) so trainer can re-apply map selection
    replaceRawCode(`this.a66=function(){aD.data=new a5c}`,
        `this.a66=function(){aD.data=new a5c;__fx.trainer?.onCustomScenarioOpen?.();}`);

    // Replace assets
    replaceOne(/(\(4,"crown",4,")[^"]+"\),/g, "$1" + assets.crownIcon + "\"),");
    replaceOne(/(\(6,"territorial\.io",6,")[^"]+"\),/g, "$1" + assets.fxClientLogo + "\"),");
    replaceOne(/(\(22,"logo",8,")[^"]+"\)/g, "$1" + assets.smallLogo + "\")");

    // Add update information
    replaceRawCode(`new k("🚀 New Game Update","The game was updated! Please reload the game.",!0,[`,
        `new k("🚀 New Game Update","The game was updated! Please reload the game."
        + "<div style='border: white; border-width: 1px; border-style: solid; margin: 10px; padding: 5px;'><h2>FX Client is not yet compatible with the latest version of the game.</h2><p>Updates should normally be available within a few hours.<br>You can still use FX to play in singleplayer mode.</p></div>",!0,[`
    );

    // Max size for custom maps: from 4096x4096 to 8192x8192
    // TODO: test this; it might cause issues with new boat mechanics?

    { // Add Troop Density and Maximum Troops in side panel
        const { valuesArray } = replaceRawCode(`,labels[5]=__L(0,"Interest"),labels[6]=__L(),labels[7]=__L(),(truncatedLabels=new Array(labels.length)).fill(""),(valuesArray=new Array(labels.length))[0]=game.io?`,
            `,labels[5]=__L(0,"Interest"),labels[6]=__L(),labels[7]=__L(),
		labels.push("Max Troops", "Density"), // add labels
		(truncatedLabels=new Array(labels.length)).fill(""),(valuesArray=new Array(labels.length))[0]=game.io?`);
        replaceOne(new RegExp(/(:(?<valueIndex>\w+)<7\?\w+\.\w+\.\w+\(valuesArray\[\2\]\)):(\w+\.\w+\(valuesArray\[7\]\))}/
            .source.replace(/valuesArray/g, valuesArray), "g"),
            '$1 : $<valueIndex> === 7 ? $3 '
            + `: $<valueIndex> === 8 ? __fx.utils.getMaxTroops(${dict.playerData}.${dict.playerTerritories}, ${playerId}) `
            + `: __fx.utils.getDensity(${playerId}) }`);
        // increase the size of the side panel by 25% to make the text easier to read
        replaceOne(/(this\.\w+=Math\.floor\(\(\w+\.\w+\.\w+\(\)\?\.1646:\.126\))\*(\w+\.\w+\),)/g, "$1 * 1.25 * $2");
    }

    // Hook bB.hZ.hg — the troop-send function called for all attacks (mouse OR spacebar)
    replaceRawCode(`this.hg=function(il,jd){this.pT&&(this.pT=0,bm.pW.pX(182,il)),aE.ko?bB.pO.hg(aE.et,il,jd):b1.pU.pY(il,jd)}`,
        `this.hg=function(il,jd){__fx.trainer?.onAttackSent?.();this.pT&&(this.pT=0,bm.pW.pX(182,il));const _fire=()=>{aE.ko?bB.pO.hg(aE.et,il,jd):b1.pU.pY(il,jd)};if(__fx.tickDelay?.queue(_fire))return;_fire();}`);

    // Expose spawn-phase replay progress
    replaceRawCode(`aCC=aD.hH?aB/aD.a5b:`,
        `aCC=aD.hH?(window.__fx_replayTick=aB,window.__fx_replayTotal=aD.a5b,aB/aD.a5b):`);

    // Expose main-game replay progress every tick: ad2 = current event index, adE = full events array
    replaceRawCode(`adD=bC.qM.aWu,adE=bC.qM.aWv;if(!(ad2>=adE.length))`,
        `adD=bC.qM.aWu,adE=bC.qM.aWv;window.__fx_replayPhase=1,window.__fx_replayTick=ad2,window.__fx_replayTotal=adE.length;if(!(ad2>=adE.length))`);

    // Allow overriding the replay speed index from outside (scrubber fast-forwards by setting 0)
    replaceRawCode(`},this.a9m=function(){return a9k[a9l]},this.zC=function(){return a9h.fH}`,
        `},this.a9m=function(){return a9k[null!=window.__fx_replaySpeedIdx?(a9l=window.__fx_replaySpeedIdx):a9l]},this.zC=function(){return a9h.fH}`);

    // Hook team game end (kl < 7): aD.a1C is set to 1 if local player's slot matches the winning slot
    replaceRawCode(`aD.kl<7?(a1R=bi.kq[aD.a0z],`,
        `aD.kl<7?(__fx.trainer?.onGameResult?.(!!aD.a1C),a1R=bi.kq[aD.a0z],`);

    // Hook 1v1 game end (kl === 8): aD.a1C is set to 1 if local player won
    replaceRawCode(`8===aD.kl?(aD.a1C?aN.a1K(aD.a1P,2):aN.a1K(1-aD.es,3),`,
        `8===aD.kl?(__fx.trainer?.onGameResult?.(!!aD.a1C),aD.a1C?aN.a1K(aD.a1P,2):aN.a1K(1-aD.es,3),`);

    // Increment win counter on wins
    replaceRawCode(`=function(sE){a8.gD[sE]&&(o.ha(sE,2),b.h9<100?xD(0,__L([a8.jx[sE]]),3,sE,ad.gN,ad.kl,-1,!0):xD(0,__L([a8.jx[sE]]),3,sE,ad.gN,ad.kl,-1,!0))`,
        `=function(sE){
		if (!${gIsSingleplayer} && !${dict.game}.${dict.gIsReplay}) {
			if (${playerId} === sE) __fx.trainer?.onLocalPlayerWon?.();
			else __fx.trainer?.onOtherPlayerWon?.();
		}
		if (${playerId} === sE && !${gIsSingleplayer} && !${dict.game}.${dict.gIsReplay})
			__fx.wins.count++, window.localStorage.setItem("fx_winCount", __fx.wins.count),
			xD(0,"Your Win Count is now " + __fx.wins.count,3,sE,ad.gN,ad.kl,-1,!0);
		a8.gD[sE]&&(o.ha(sE,2),b.h9<100?xD(0,__L([a8.jx[sE]]),3,sE,ad.gN,ad.kl,-1,!0):xD(0,__L([a8.jx[sE]]),3,sE,ad.gN,ad.kl,-1,!0))`);


    { // Add settings button and custom lobby button
        // add buttons
        replaceRawCode(`,new nQ("☰<br>"+__L(),function(){aD6(3)},aa.ks),new nQ("",function(){at.d5(12)},aa.kg,!1)]`,
            `,new nQ("☰<br>"+__L(),function(){aD6(3)},aa.ks),new nQ("",function(){at.d5(12)},aa.kg,!1),
            new nQ("FX Client settings", function() { __fx.WindowManager.openWindow("settings"); }, "rgba(0, 0, 20, 0.5)"),
            new nQ("Join/Create custom lobby", function() { __fx.customLobby.showJoinPrompt(); }, "rgba(20, 9, 77, 0.5)"),
            new nQ("Practice Mode", function() { __fx.trainer.showSelector(); }, "rgba(0, 50, 10, 0.5)"),
            new nQ("Stats", function() { __fx.trainer.showStats(); }, "rgba(50, 30, 0, 0.5)")]`)
        // set position
        replaceRawCode(`aZ.g5.vO(aD3[3].button,x+a0S+gap,a3X+h+gap,a0S,h);`,
            `aZ.g5.vO(aD3[3].button,x+a0S+gap,a3X+h+gap,a0S,h);
            aZ.g5.vO(aD3[5].button, x, a3X + h * 2 + gap * 2, a0S * 2 + gap, h / 3);
            aZ.g5.vO(aD3[6].button, x, a3X + h * 2.33 + gap * 3, a0S * 2 + gap, h / 3);
            aZ.g5.vO(aD3[7].button, x, a3X + h * 2.66 + gap * 4, a0S * 2 + gap, h / 3);
            aZ.g5.vO(aD3[8].button, x, a3X + h * 3 + gap * 5, a0S * 2 + gap, h / 3);`);
    }

    { // Keybinds
        // match required variables
        const { 0: match, groups: { attackBarObject, setRelative } } = matchOne(/:\w+\.\w+\(\w+,8\)\?(?<attackBarObject>\w+)\.(?<setRelative>\w+)\(32\/31\):/g);
        // create a setAbsolutePercentage function on the attack percentage bar object,
        // and also register the keybind handler functions
        replaceOne(/}(function \w+\((\w+)\){return!\(1<\2&&1===(?<attackPercentage>\w+)\|\|\(1<\2&&\2\*\3-\3<1\/1024\?\2=\(\3\+1\/1024\)\/\3:\2<1)/g,
            "} this.setAbsolutePercentage = function(newPercentage) { $<attackPercentage> = newPercentage; }; "
            + "__fx.keybindFunctions.setAbsolute = this.setAbsolutePercentage; "
            + `__fx.keybindFunctions.setRelative = (arg1) => ${attackBarObject}.${setRelative}(arg1); $1`);
        // insert keybind handling code into the keyDown handler function
        replaceOne(new RegExp(/(function \w+\((?<event>\w+)\){)([^}]+matched)/g.source.replace(/matched/g, escapeRegExp(match)), "g"),
            "$1 if (__fx.keybindHandler($<event>.key)) return; $3");
    }

    // Set the default font to Trebuchet MS
    replace(/sans-serif"/g, 'Trebuchet MS"');

    // Realistic bot names setting
    // matches c4[i] = c4[i].replace(a6U[dx], a6V[dx])
    replaceOne(/(((\w+)\[\w+\])=\2\.replace\(\w+(\[\w+\]),\w+\4\))/g, "$1; if (__fx.settings.realisticNames) $3 = realisticNames;")

    // Hide all links in main menu depending on settings
    //replaceOne(/(this\.\w+=function\(\){)((\w+\.\w+)\[2\]=\3\[3\]=\3\[4\]=(?<linksHidden>!this\.\w+\.\w+),)/g,
    //"$1 if (settings.hideAllLinks) $3[0] = $3[1] = $<linksHidden>; else $3[0] = $3[1] = true; $2")

    // Clear canvas background if a custom background is being used
    replaceRawCode(`,this.qk=function(){var a4n,a4m;aq.pd?(a4m=aL.gA/aq.eE,a4n=aL.gF/aq.eF,canvas.setTransform(a4m=a4n<a4m?a4m:a4n,0,0,a4m,`,
        `,this.qk=function(){var a4n,a4m;
        if (__fx.makeMainMenuTransparent) canvas.clearRect(0,0,aL.gA,aL.gF);
        else aq.pd?(a4m=aL.gA/aq.eE,a4n=aL.gF/aq.eF,canvas.setTransform(a4m=a4n<a4m?a4m:a4n,0,0,a4m,`);

    // Track donations
    replaceOne(/(this\.\w+=function\((\w+),(\w+)\)\{)(\2===\w+\.\w+&&\(\w+\.\w+\((\w+\.\w+)\[0\],\5\[1\],\3\),this\.(\w+)\[12\]\+=\5\[1\],this\.\6\[16\]\+=\5\[0\]\),\3===\w+\.\w+&&\()/g,
        `$1 __fx.donationsTracker.logDonation($2, $3, $5[0], ${dict.sidebar}.${dict.getTime}()); $4`)

    // Display donations for a player when clicking on them in the leaderboard
    // and skip handling clicks when clicking on an empty space (see the isEmptySpace
    // variable in the modified leaderboard click handler from the leaderboard filter)
    // match , 0 !== dG[x]) && fq.hB(x, 800, false, 0),
    replaceOne(/(0!==\w+\.\w+\[(\w+)\])(\)&&\w+\.\w+\(\2,800,!1,0\),)/g,
        `${dict.game}.${dict.gIsTeamGame} && __fx.settings.openDonationHistoryFromLb && __fx.donationsTracker.displayHistory($2, ${rawPlayerNames}, ${gIsSingleplayer}), $1 && !isEmptySpace $3`);

    // Detailed team pie chart percentage
    replaceRawCode(`qr=Math.floor(100*f0+.5)+"%"`,
        `qr = (__fx.settings.detailedTeamPercentage ? (100*f0).toFixed(2) : Math.floor(100*f0+.5)) + "%"`)
    replaceRawCode(",fontSize=+dz*Math.min(f0,.37);", ",fontSize=(__fx.settings.detailedTeamPercentage ? 0.75 : 1)*dz*Math.min(f0,.37);")

    console.log('Removing ads...');
    // Remove ads
    replace('//api.adinplay.com/libs/aiptag/pub/TRT/territorial.io/tag.min.js', '');
}
