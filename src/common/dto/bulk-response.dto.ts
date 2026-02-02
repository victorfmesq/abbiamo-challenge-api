import { ApiProperty } from '@nestjs/swagger';

export class BulkOperationResponseDto {
  @ApiProperty({
    description: 'Indica se a operação em massa foi executada com sucesso',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Quantidade de entregas atualizadas com sucesso',
    example: 5,
  })
  updated: number;

  @ApiProperty({
    description: 'Quantidade de entregas não encontradas',
    example: 0,
  })
  notFound: number;

  @ApiProperty({
    description: 'Lista de IDs das entregas que não foram encontradas',
    example: [],
    type: [String],
  })
  notFoundIds: string[];

  @ApiProperty({
    description: 'Dados das entregas atualizadas',
    example: [],
    type: [Object],
  })
  data: any[];
}
