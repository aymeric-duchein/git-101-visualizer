import { createGitgraph } from "@gitgraph/js";


let current = 0;
const graphContainer = document.getElementById("gitgraph");
const graphContainer2 = document.getElementById("gitgraph2");
graphContainer.style.opacity = '0';
graphContainer2.style.opacity = '1';

graphContainer.addEventListener('scroll', event => {
console.log(event);
  graphContainer2.scrollTop = graphContainer.scrollTop;
});
graphContainer2.addEventListener('scroll', event => {
  graphContainer.scrollTop = graphContainer2.scrollTop;

});
function fadeIn1() {
  if (parseFloat(graphContainer.style.opacity) < 1) {
    graphContainer.style.opacity = (parseFloat(graphContainer.style.opacity) + 0.1) + '';
    setTimeout(() => fadeIn1(), 25);
  } else {
    fadeOut2();
  }
}

function fadeOut1() {
  if (parseFloat(graphContainer.style.opacity) > 0) {
    graphContainer.style.opacity = (parseFloat(graphContainer.style.opacity) - 0.1) + '';
    setTimeout(() => fadeOut1(), 25);
  } else {
    graphContainer.innerHTML = '';
  }
}

function fadeIn2() {
  if (parseFloat(graphContainer2.style.opacity) < 1) {
    graphContainer2.style.opacity = (parseFloat(graphContainer2.style.opacity) + 0.1) + '';
    setTimeout(() => fadeIn2(), 25);
  } else {
    fadeOut1();
  }
}

function fadeOut2() {
  if (parseFloat(graphContainer2.style.opacity) > 0) {
    graphContainer2.style.opacity = (parseFloat(graphContainer2.style.opacity) - 0.1) + '';
    setTimeout(() => fadeOut2(), 25);
  } else {
    graphContainer2.innerHTML = '';
  }
}

setInterval(() => {
  let gitgraph;
  if (current === 1) {
    gitgraph = createGitgraph(graphContainer);
  } else {
    gitgraph = createGitgraph(graphContainer2);
  }

  const req = new XMLHttpRequest();
  req.open('GET', 'http://localhost:3000/', false);
  req.send(null);

  if (req.status === 200) {
    const logs = req.responseText;
    gitgraph.import(JSON.parse(logs));
  }
  current = (current + 1 ) % 2;
  current === 1 ? fadeIn2() : fadeIn1();
}, 2000);

/*
  CHECK THE DOCS BEFORE DOING SOMETHING LIKE THIS!!!!

function isBlocked(currentCommit, curM) {
  return c => c.parents.length === 1 && c.parents[0] === currentCommit.hash && curM.some(l => l.some(cM => cM.branch === c.branch));
}
function getBranch(commit, branches) {
  return branches.find(b => b.label === commit.branch).branch;
}
const lines = logs.split('\n');
    let commits = lines.filter(l => l.length > 0).map(l => {
      let commitCount = 0;
      let commit = { hash:'', parents: [], subject: '', branch: []};
      while (new RegExp(/^[0-9abcdef]{7}/).test(l.substring(0,7))) {
        commitCount++;
        if (commitCount === 1) {
          commit.hash = l.substring(0,7);
        } else {
          commit.parents.push(l.substring(0,7))
        }
        l = l.substr(8);
      }
      if (new RegExp(/^\(((?!tag).*)\)/).test(l)) {
        commit.branch = new RegExp(/^\((.*)\)/).exec(l)[1].split(',').map(b => b.trim());
        l = l.substring(l.indexOf(')') + 1).trim();
      }
      commit.subject = l;
      return commit;
    });

    commits.forEach((c) => {
      if (c.branch.length === 0) {
        commits.forEach((c2) => {
          if (c2.parents.includes(c.hash) && c.branch.length === 0) {
            c.branch = [c2.branch[0]];
          }
        })
      }
    });

    commits = commits.reverse();

    let branches: {start: string; label: string; branch?: any}[] =  [{start: null, label: commits[0].branch[0]}];
    commits.forEach((c) => {
      if (c.branch.length > 1) {
        branches = [...branches, ...c.branch.filter((b,i)=> i> 0).map(b => ({start: c.hash, label: b}))];
        c.branch = [c.branch[0]]
      }
    });

    commits.forEach((c) => {
        c.branch = c.branch[0]
    });

    commits.forEach(c => {
      if (!branches.some(r => r.label === c.branch as any)) {
        branches = [...branches, {label: c.branch as any, start: c.parents[0]}];
      }
    });

    let merges = [];
    commits.forEach(c => {
      if (c.parents.length > 1) {
        merges.push(c.parents.map(p => ({hash: p, branch: branches.find(b => b.label === commits.find(c2 => c2.hash === p).branch as any ).label})))
      }
    });

    branches[0].branch = gitgraph.branch(branches[0].label);
    let availableCommits = [commits[0]];
    let doneCommits = [];
    let blockedCommit = [];
    while(availableCommits.length > 0 ) {
      let currentCommit = availableCommits[0];
      getBranch(currentCommit, branches).commit({subject: currentCommit.subject, hash: currentCommit.hash, author: ''});
      doneCommits.push(currentCommit);

      branches.filter(b => b.start === currentCommit.hash).forEach(b => b.branch = b.branch || gitgraph.branch(b.label));
      availableCommits = availableCommits.slice(1);
      let curM = merges.filter(m => m.some(c => c.hash === currentCommit.hash));

      if (curM.length === 0) {
        availableCommits = [ ...availableCommits, ...commits.filter(c => c.parents.length === 1 && c.parents[0] === currentCommit.hash)];
      } else {
        availableCommits = [ ...availableCommits, ...commits.filter(c => c.parents.length === 1 && c.parents[0] === currentCommit.hash && !curM.some(l => l.some(cM => cM.branch === c.branch)))];
        blockedCommit = [ ...blockedCommit, ...commits.filter(isBlocked(currentCommit, curM)).map(c => ({...c, by: [...curM]}))];
        blockedCommit = blockedCommit.reduce((acc, n) => {
          let common = acc.find(c => c.hash === n.hash);
          if (common != null) {
            return [...acc.filter(c=> c.hash !== n.hash), {...n, by: [...common.by, ...n.by]}]
          } else {
            return [...acc, n];
          }
        }, [])
      }

      if (availableCommits.length === 0) {
        merges.filter(m => m.every(c => doneCommits.some(dC => dC.hash === c.hash))).forEach(m => {
          let mergeCommit = commits.find(c => m.every(mC => c.parents.includes(mC.hash)));
          if (!doneCommits.some(c => c.hash === mergeCommit.hash)) {
            getBranch(mergeCommit, branches).merge({
              branch: getBranch(commits.find(c => m.some(mC => c.hash === mC.hash && c.hash !== mergeCommit.hash)) ,branches),
              commitOptions: {subject: mergeCommit.subject, hash: mergeCommit.hash, author: ''}
            });

            branches.filter(b => b.start === mergeCommit.hash).forEach(b => {
              b.branch = b.branch || gitgraph.branch(b.label);
            });

            doneCommits.push(mergeCommit);
            availableCommits = [ ...availableCommits, ...commits.filter(c => c.parents.length === 1 && c.parents[0] === mergeCommit.hash)];
            availableCommits = [ ...availableCommits, ...blockedCommit.filter(c => {
              return c.by.reduce((acc, n) => [...acc, ...n]).every(mC => doneCommits.some(dC => dC.hash === mC.hash))
            })];
            blockedCommit = blockedCommit.filter(c => !c.by.reduce((acc, n) => [...acc, ...n]).every(mC => doneCommits.some(dC => dC.hash === mC.hash)));
          }
        })
      }

      if (availableCommits.length === 0) {

      }
    }*/