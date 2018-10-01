let totalNumberOfProjects = 0;
let singleton = null;
let singleton1 = null;
let id = 0;
const daysWithoutWorkLimit=3;
const complexityMin=1;
const complexityMax=3;
const receivedProjectsMin=0;
const receivedProjectsMax=4;


function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Project {
    get id() {
        return this._id;
    }
    constructor(complexity) {
        this._id=id+=1;
        this.complexity = complexity;
    }
}
class projectWeb extends Project{}
class projectMobile extends Project{}

class Dev {
    constructor(project) {
        this.doneProjects = 0;
        this.daysWithoutWork = 0;
        this.project = null;
        this.workProject(project);
    }


    workProject(project, workInTeam) {
        this.project = project;
        this.daysWithoutWork = 0;
        if (project instanceof projectWeb)
            this.work = project.complexity;
        else if(project instanceof projectMobile)
            this.work = workInTeam ? 1 : project.complexity;
        else
            this.work = 1;
    }


    completedProjects(){
        this.doneProjects += 1;
        this.project = null;
    }
}

class Dep {
    constructor(build) {
        this.type = build.type;
        this.number=build.number;
        this.devs = [];
        this.testedProjects = [];
        this.workDoneProjects = [];
    }


    static get Builder() {
        class Builder {
            constructor(type) {
                this.type = type;
            }
            number(number){
                this.number=number;
                return this;
            }
            build() {
                return new Dep(this);
            }
        }
        return Builder;
    }


    chooseFreeDev(value) {
        if (!value)
            return this.devs.find(dev => !dev.project);
        return this.devs.filter(dev => !dev.project);
    }


    projectDistribution(project) {

        if (this.type !== "mobile") {
            const dev = this.chooseFreeDev();
            if (!dev)
                return false;
            dev.workProject(project);
            return true;
        }

        if (!this.chooseFreeDev(true).length)
            return false;

        if (this.chooseFreeDev(true).length < project.complexity)
            this.chooseFreeDev(true)[0].workProject(project);
        else
            for (let i = 0; i < project.complexity; i += 1)
                this.chooseFreeDev(true)[i].workProject(project, true);

        return true;
    }


    dayAdding() {
        this.devs.forEach((dev) => {
            const {work, project} = dev;
        if (!project)
            dev.daysWithoutWork += 1;

        if (work)
            dev.work -= 1;

        if (!dev.work && project) {
            if (this.type === "QA")
                this.workDoneProjects.push(project);
            else if (!this.testedProjects.find(proj => proj.id === project.id))
            this.testedProjects.push(project);
            dev.completedProjects();
        }
    });
    }


    newDev(dev) {
        this.devs.push(dev);
    }
}

const QA1=new Dep.Builder("QA").number(1).build();
const QA2=new Dep.Builder("QA").number(2).build();
const web1=new Dep.Builder("web").number(1).build();
const web2=new Dep.Builder("web").number(2).build();
const mobile1=new Dep.Builder("mobile").number(1).build();
const mobile2=new Dep.Builder("mobile").number(2).build();


class Firm {


    constructor() {
        if (!singleton) {
            this.hiredDevs = 0;
            this.dissmissedDevs = 0;
            this.departments={web1,web2,mobile1,mobile2,QA1,QA2};
            this.previousProjects = [];
            this.testedProjects = [];
            singleton = this;
        }
        return singleton;
    }


    takeProjects(projects) {
        projects.forEach(project => {
            if (!(web1||web2||mobile1||mobile2).projectDistribution(project))
                this.previousProjects.push(project);
    });
    }


    dayAdding() {
        this.testedProjects.forEach(project => {
            if (!(QA1||QA2).projectDistribution(project)) {
                if (random(0,1)===0)
                    QA2.newDev(new Dev(project));
                else
                    QA1.newDev(new Dev(project));
            this.hiredDevs += 1;
        }
    });

        this.testedProjects.length=0;

        Object.keys(this.departments).forEach(key => {
            this.departments[key].dayAdding();
    });

        this.previousProjects.forEach(project => {
        if(project instanceof projectWeb){
            if(random(0, 1)===0){
                web1.newDev(new Dev(project));
                this.hiredDevs += 1;
            }
            else{
                web2.newDev(new Dev(project));
                this.hiredDevs += 1;
            }
        }else if(project instanceof projectMobile){
            if(random(0, 1)===0) {
                mobile1.newDev(new Dev(project));
                this.hiredDevs += 1;
            }
            else {
                mobile2.newDev(new Dev(project));
                this.hiredDevs += 1;
            }
        }
    });

        this.previousProjects.length=0;

        Object.keys(this.departments).forEach(key => {
            if (this.departments[key].type !== "QA") {
            this.departments[key].testedProjects.forEach(proj => this.testedProjects.push(proj));
            this.departments[key].testedProjects.length=0;
        }
    });
        this.dismissal();
    }


    dismissal() {
        let goAway,department, indexInList;

        Object.keys(this.departments).forEach(key => {
            this.departments[key].devs.forEach((dev,index) => {
            if (dev.daysWithoutWork > daysWithoutWorkLimit && (!goAway || goAway.doneProjects > dev.doneProjects)) {
            goAway = dev;
            department = key;
            indexInList=index;
        }
    });
    });

        if (goAway && department && indexInList) {
            this.departments[department].devs.splice(indexInList,1);
            this.dissmissedDevs += 1;
        }
    }

    static createProjects() {
        const projects = [];
        let z=random(receivedProjectsMin, receivedProjectsMax);
        while(z!==0){
            if(random(0,2)===0)
                projects.push(new projectWeb(random(complexityMin, complexityMax)));
            else
                projects.push(new projectMobile(random(complexityMin, complexityMax)));
            z--;
        }
        return projects;
    }


    statDetail(){
        console.log(web1.devs.length,web1.type,web1.number);
        console.log(web2.devs.length,web2.type,web2.number);
        console.log(mobile1.devs.length,mobile1.type,mobile1.number);
        console.log(mobile2.devs.length,mobile2.type,mobile2.number);
        console.log(QA1.devs.length,QA1.type,QA1.number);
        console.log(QA2.devs.length,QA2.type,QA2.number);
        console.log("Поступившие количество проектов:", totalNumberOfProjects);
        console.log("Количество готовых проектов: ", QA1.workDoneProjects.length);
        console.log("Нанятые: ", this.hiredDevs);
        console.log("Уволенные: ", this.dissmissedDevs);
    }
    stat(){
        console.log("Общее количество проектов:", totalNumberOfProjects);
        console.log("Количество готовых проектов: ", QA1.workDoneProjects.length);
        console.log("Нанятые: ", this.hiredDevs);
        console.log("Уволенные: ", this.dissmissedDevs);
    }
}

class live {
    constructor() {
        if (!singleton1) {
            this.Comp=new Firm;
            singleton1=this;
        }
        return singleton1;
    }

    live(days,param) {
        if(param==="detail"){
            for(let i=0;i<days;i++) {
                console.log("День:",i);
                const projects = Firm.createProjects();
                totalNumberOfProjects += projects.length;
                this.Comp.takeProjects(projects);
                this.Comp.statDetail();
                this.Comp.dayAdding();
            }
        }else{
            for(let i=0;i<days;i++) {
                const projects = Firm.createProjects();
                totalNumberOfProjects += projects.length;
                this.Comp.takeProjects(projects);
                this.Comp.dayAdding();
            }
            this.Comp.stat();
        }
    }
}

let Live=new live();
Live.live(100,"detail");