<?php require_once __DIR__ . '/../include.php'; ?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Genetic Cars</title>
        <?= css('bootstrap'); ?>
        <?= css('screen'); ?>
    </head>
    <body>
        <canvas id="mainbox" class="overlay" width="800" height="400"></canvas>
        <div class="overlay">
            <nav class="main-nav">
                <a class="button live">Live View</a>
                <a class="button">Minimap</a>
                <a class="button">Statistics</a>
                <a class="button">Settings</a>
            </nav>
            <section class="sidebar">
                <div id="data">
                    <div id="health-bars"></div>
                    <div class="checkbox">
                        <label>
                            <input name="full-speed" type="checkbox"> Full Speed
                        </label>
                    </div>
                    <input class="btn btn-default" type="button" value="Stop" onclick="Handler.stop()" />
                    <div class="form-inline">
                        <label form="">Create new world with seed:</label>
                        <input class="form-control" type="text" value="Enter any string" id="newseed" />
                        <input class="btn btn-default" type="button" value="Go!" onclick="cw_confirmResetWorld()" />
                    </div>
                    <div class="form-group">
                        <label for="mutationrate">Mutation rate:</label>
                        <select id="mutationrate" name="mutationrate" onchange="cw_setMutation(this.options[this.selectedIndex].value)" class="form-control">
                            <option value="0">0%</option>
                            <option value="0.01">1%</option>
                            <option value="0.02">2%</option>
                            <option value="0.03">3%</option>
                            <option value="0.04">4%</option>
                            <option value="0.05" selected="selected">5%</option>
                            <option value="0.1">10%</option>
                            <option value="0.2">20%</option>
                            <option value="0.3">30%</option>
                            <option value="0.4">40%</option>
                            <option value="0.5">50%</option>
                            <option value="0.75">75%</option>
                            <option value="1.0">100%</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label form="mutationsize">Mutation size:</label>
                        <select id="mutationsize" name="mutationsize" onchange="cw_setMutationRange(this.options[this.selectedIndex].value)" class="form-control">
                            <option value="0">0%</option>
                            <option value="0.01">1%</option>
                            <option value="0.02">2%</option>
                            <option value="0.03">3%</option>
                            <option value="0.04">4%</option>
                            <option value="0.05">5%</option>
                            <option value="0.1">10%</option>
                            <option value="0.2">20%</option>
                            <option value="0.3">30%</option>
                            <option value="0.4">40%</option>
                            <option value="0.5">50%</option>
                            <option value="0.75">75%</option>
                            <option value="1.0" selected="selected">100%</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label form="floor">Floor:</label>
                        <select id="floor" name="floor" onchange="cw_setMutableFloor(this.options[this.selectedIndex].value)" class="form-control">
                            <option value="0" selected="selected">fixed</option>
                            <option value="1">mutable</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label form="gravity">Gravity:</label>
                        <select id="gravity" name="gravity" onchange="cw_setGravity(this.options[this.selectedIndex].value)" class="form-control">
                            <option value="24.8">Jupiter (24.8)</option>
                            <option value="11.2">Neptune (11.2)</option>
                            <option value="10.4">Saturn (10.4)</option>
                            <option value="9.81" selected="selected">Earth (9.81)</option>
                            <option value="8.9">Venus (8.9)</option>
                            <option value="8.7">Uranus (8.7)</option>
                            <option value="3.7">Mars/Mercury (3.7)</option>
                            <option value="1.6">Moon (1.6)</option>
                        </select>
                    </div>
                    <div>
                        <label form="elitesize">Elite clones:</label>
                        <select id="elitesize" name="elitesize" onchange="cw_setEliteSize(this.options[this.selectedIndex].value)" class="form-control">
                            <option value="0">0</option>
                            <option value="1" selected="selected">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                        </select>
                    </div>
                    <div id="generation"></div>
                    <div id="cycles-per-second"></div>
                    <div id="population"></div>
                    <div id="distancemeter"></div>
                    <!-- <input type="button" value="Watch Leader" onclick="cw_setCameraTarget(-1)" /> -->
                    <div id="cars"></div>
                </div>
            </section>
            <section class="window"></section>
            <section class="main">
                <div id="minimapholder">
                    <canvas id="minimap" width="800" height="200"></canvas>
                    <div id="minimapcamera"></div>
                </div>
                <div id="graphholder">
                    <canvas id="graphcanvas" width="400" height="250"></canvas>
                    <div class="scale" id="s100">250</div>
                    <div class="scale" id="s75">187</div>
                    <div class="scale" id="s50">125</div>
                    <div class="scale" id="s25">62</div>
                    <div class="scale" id="s0">0</div>
                </div>
                <div id="topscoreholder">
                    <input type="button" value="View top replay" onclick="cw_toggleGhostReplay(this)" /><br />
                    <div id="topscores"></div>
                </div>
                <div id="debug"></div>
                <div id="explanation">
                </div>
                <div name="minimapmarker" class="minimapmarker"></div>
            </section>
        </div>

        <?= js('lib/jquery'); ?>
        <?= js('lib/bootstrap'); ?>
        <?= js('lib/seedrandom'); ?>
        <?= js('lib/box2d'); ?>

        <?= js('../../../private/js/templates.js'); ?>

        <?= js('../../../private/js/ghost.js'); ?>
        <?= js('../../../private/js/path.js'); ?>

        <?= js('../../../private/js/car-group.js'); ?>
        <?= js('../../../private/js/car-manager.js'); ?>
        <?= js('../../../private/js/car-definition.js'); ?>
        <?= js('../../../private/js/handler.js'); ?>
        <?= js('../../../private/js/ui.js'); ?>

        <?= js('../../../private/js/variables.js'); ?>
        <?= js('../../../private/js/car.js'); ?>
        <?= js('../../../private/js/generation.js'); ?>
        <?= js('../../../private/js/drawing.js'); ?>
        <?= js('../../../private/js/sim.js'); ?>

        <?= js('../../../private/js/process.js'); ?>

        <?= js('../../../private/js/graphs.js'); ?>

        <!--<?= js('generic-cars'); ?>-->
    </body>
</html>
