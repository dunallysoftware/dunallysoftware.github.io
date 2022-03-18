var sharedData;
const REFERENCE_WIDTH=720;
export function getSharedData()
{
	if (!sharedData)
	{
		sharedData = new SharedData();
	}
	return sharedData;
}




export default class SharedData {
	gameHeight=0;
	gameWidth=0;
	gameLeft=0;
	gameRight=0;
	paused=false;


	scaledSize = function(size)
	{
		return (size/REFERENCE_WIDTH)*this.gameWidth;
	}

}
