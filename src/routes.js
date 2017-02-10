import xs from 'xstream';

export default [
  {
    path: '/',
    action: (context) => ({
      context,
      component: xs.fromPromise(System.import('./home'))
    })
  }, {
    path: '/student',
     action: (context) => ({
       context,
       component: xs.fromPromise(System.import('./student/search'))
     })
  }, {
    path: '/student/:id',
    action: (context) => ({
      context,
      component: xs.fromPromise(System.import('./student/profile'))
    })
  }, {
    path: '*',
    action: (context) => ({
      context,
      component: xs.fromPromise(System.import('./notFound'))
    })
  }
]
