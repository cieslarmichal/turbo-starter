export const symbols = {
  config: Symbol('config'),
  loggerService: Symbol('loggerService'),
  uuidService: Symbol('uuidService'),
  databaseClient: Symbol('databaseClient'),
  s3Client: Symbol('s3Client'),
  s3Service: Symbol('s3Service'),
  httpService: Symbol('httpService'),
  sendGridService: Symbol('sendGridService'),
  applicationHttpController: Symbol('applicationHttpController'),
};

export const coreSymbols = {
  config: symbols.config,
  loggerService: symbols.loggerService,
  uuidService: symbols.uuidService,
  databaseClient: symbols.databaseClient,
  s3Client: symbols.s3Client,
  s3Service: symbols.s3Service,
  httpService: symbols.httpService,
  sendGridService: symbols.sendGridService,
};
