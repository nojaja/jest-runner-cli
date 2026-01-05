module.exports = {
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsConfig: {
      fileName: 'tsconfig.json'
    }
  },
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '循環依存は許可されていません。設計を見直してください。',
      from: {},
      to: {
        circular: true
      }
    }
    ,
    {
      name: 'no-src-to-test',
      severity: 'error',
      comment: '`src` から `test` への依存は禁止されています。テストコードはテストからのみ参照してください。',
      from: {
        path: '^src'
      },
      to: {
        path: '^test'
      }
    }
  ]
};
