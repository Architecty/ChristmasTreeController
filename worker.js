'use strict';
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
var DDP = require('ddp'),
    Job = require('meteor-job'),
    MongoClient = require('mongodb').MongoClient,
    ddpLogin = require('ddp-login'),
    Gpio = require('onoff').Gpio,
    lirc_node = require('lirc_node'),
    config = require('./config.js'),
    sleep = require('sleep');


var ddp = new DDP({
    host: config.ddpHost,
    port: config.ddpPort,
    use_ejson: true
})

Job.setDDP(ddp);


ddp.connect(function(err) {
    if (err) throw err;
    ddpLogin(ddp, {
        env: "METEOR_TOKEN",
        method: "account",
        account: config.ddpEmail,
        pass: config.ddpPassword,
        retry: 5,
        plaintext: false
    }, function (err, userInfo) {
        if (err) throw err;

        lirc_node.init();
        var strands = [];
        config.strandPins.forEach((pinAssignment)=>{
            strands.push(new Gpio(pinAssignment, 'out'));
    });

        MongoClient.connect(config.mongoURI, function (err, db) {
            console.log("Worker Started Up");
            Job.processJobs('jobs', 'commandTree', {concurrency:1, workTimeout: 15 * 1000}, function(job, cb){
                processTree(lirc_node, strands, job, cb, db);
            });
        })
    })
});

function processTree(lirc_node, strands, job, cb, db){
    if(job.data){
        var actions = job.data.actions;
        console.log("has actions");
        while(actions.length){
            var thisAction = actions.shift();
            strands.forEach((strand, index)=>{
                if(thisAction.strands.indexOf(index) > -1 || thisAction.strands === 'ALL'){
                console.log("Running strand", index)
                strand.writeSync(1);
            } else {
                strand.writeSync(0);
            }
        });
            sleep.msleep(300);
            lirc_node.irsend.send_once('homestarry-13-colors', thisAction.key);
            console.log(thisAction);
            sleep.msleep(thisAction.wait);
        }

        if(job.data.repeat){
            db.collection('treeJobs').find({'status': 'ready'}).toArray(function(err, docs){
                if(docs.length){
                    Job('onumaJobs', 'spaceValueListUpdate', job.data).priority('normal').save();
                }
                job.done();
                cb();
            })
        } else {
            job.done();
            cb();
        }

    } else {
        job.done();
        cb();
    }

}