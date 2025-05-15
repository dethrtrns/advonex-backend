import {
    applyDecorators,
    Type,
  } from '@nestjs/common';
  import {
    ApiExtraModels,
    ApiOkResponse,
    getSchemaPath,
  } from '@nestjs/swagger';
  import { ApiResponseDto } from '../dto/api-response.dto';
  
  export const ApiStandardResponse = <TModel extends Type<any>>(
    model: TModel,
    message = 'Operation completed successfully',
  ) => {
    return applyDecorators(
      ApiExtraModels(ApiResponseDto, model),
      ApiOkResponse({
        description: message,
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiResponseDto) },
            {
              properties: {
                data: { $ref: getSchemaPath(model) },
                message: {
                  type: 'string',
                  example: message,
                },
                success: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
          ],
        },
      }),
    );
  };
  