
function findReactComponent(dom, traverseUp = 0) {
  const key = Object.keys(dom).find(key => key.startsWith("__reactInternalInstance$"));
  const domFiber = dom[key];
  if (domFiber == null) return null;

  const GetCompFiber = fiber => {
    //return fiber._debugOwner; // this also works, but is __DEV__ only
    let parentFiber = fiber.return;
    while (typeof parentFiber.type == "string") {
      parentFiber = parentFiber.return;
    }
    return parentFiber;
  };

  let compFiber = GetCompFiber(domFiber);
  for (let i = 0; i < traverseUp; i++) {
    compFiber = GetCompFiber(compFiber);
  }
  return compFiber.stateNode;
}
