/*
 * JavaScript ID3 Tag Reader 0.1.2
 * Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 * 
 * Extended by António Afonso (antonio.afonso@opera.com), Opera Software ASA
 * Modified by António Afonso <antonio.afonso gmail.com>
 */

var StringUtils = {
    readUTF16String: function(bytes, bigEndian, maxBytes) {
        var ix = 0;
        var offset1 = 1, offset2 = 0;
        maxBytes = Math.min(maxBytes||bytes.length, bytes.length);

        if( bytes[0] == 0xFE && bytes[1] == 0xFF ) {
            bigEndian = true;
            ix = 2;
        } else if( bytes[0] == 0xFF && bytes[1] == 0xFE ) {
            bigEndian = false;
            ix = 2;
        }
        if( bigEndian ) {
            offset1 = 0;
            offset2 = 1;
        }

        var arr = [];
        for( var j = 0; ix < maxBytes; j++ ) {
            var byte1 = bytes[ix+offset1];
            var byte2 = bytes[ix+offset2];
            var word1 = (byte1<<8)+byte2;
            ix += 2;
            if( word1 == 0x0000 ) {
                break;
            } else if( byte1 < 0xD8 || byte1 >= 0xE0 ) {
                arr[j] = String.fromCharCode(word1);
            } else {
                var byte3 = bytes[ix+offset1];
                var byte4 = bytes[ix+offset2];
                var word2 = (byte3<<8)+byte4;
                ix += 2;
                arr[j] = String.fromCharCode(word1, word2);
            }
        }
        var string = new String(arr.join(""));
        string.bytesReadCount = ix;
        return string;
    },
    readUTF8String: function(bytes, maxBytes) {
        var ix = 0;
        maxBytes = Math.min(maxBytes||bytes.length, bytes.length);

        if( bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF ) {
            ix = 3;
        }
        var byte1 = null;
        var byte2 = null;
        var byte3 = null;
        var byte4 = null;
        var arr = [];
        for( var j = 0; ix < maxBytes; j++ ) {
            byte1 = bytes[ix++];
            if( byte1 == 0x00 ) {
                break;
            } else if( byte1 < 0x80 ) {
                arr[j] = String.fromCharCode(byte1);
            } else if( byte1 >= 0xC2 && byte1 < 0xE0 ) {
                byte2 = bytes[ix++];
                arr[j] = String.fromCharCode(((byte1&0x1F)<<6) + (byte2&0x3F));
            } else if( byte1 >= 0xE0 && byte1 < 0xF0 ) {
                byte2 = bytes[ix++];
                byte3 = bytes[ix++];
                arr[j] = String.fromCharCode(((byte1&0xFF)<<12) + ((byte2&0x3F)<<6) + (byte3&0x3F));
            } else if( byte1 >= 0xF0 && byte1 < 0xF5) {
                byte2 = bytes[ix++];
                byte3 = bytes[ix++];
                byte4 = bytes[ix++];
                let codepoint = ((byte1&0x07)<<18) + ((byte2&0x3F)<<12)+ ((byte3&0x3F)<<6) + (byte4&0x3F) - 0x10000;
                arr[j] = String.fromCharCode(
                    (codepoint>>10) + 0xD800,
                    (codepoint&0x3FF) + 0xDC00
                );
            }
        }
        var string = new String(arr.join(""));
        string.bytesReadCount = ix;
        return string;
    },
    readNullTerminatedString: function(bytes, maxBytes) {
        var arr = [];
        maxBytes = maxBytes || bytes.length;
        for ( var i = 0; i < maxBytes; ) {
            var byte1 = bytes[i++];
            if( byte1 == 0x00 ) break;
		    arr[i-1] = String.fromCharCode(byte1);
	    }	    
        var string = new String(arr.join(""));
        string.bytesReadCount = i;
        return string;
    }
};

class BinaryFile{
    constructor(strData, iDataOffset, iDataLength){
        this.data = strData;
        this.dataOffset = iDataOffset || 0;
        this.dataLength = 0;
        
        
        this.strData = strData;
        this.iDataOffset = iDataOffset;
        this.iDataLength = iDataLength;
    }
    getRawData() {
		return this.data;
	};
    getByteAt(iOffset){
        if (typeof this.strData == "string")
        {
            this.dataLength = this.iDataLength || this.data.length;
            return this.data.charCodeAt(iOffset + this.dataOffset) & 0xFF;
        }
        else if (typeof this.strData == "unknown") 
        {
            this.dataLength = this.iDataLength || IEBinary_getLength(this.data);
            return IEBinary_getByteAt(this.data, iOffset + this.dataOffset);
        }
    }
    getBytesAt(iOffset, iLength) {
        var bytes = new Array(iLength);
        for( var i = 0; i < iLength; i++ ) {
            bytes[i] = this.getByteAt(iOffset+i);
        }
        return bytes;
    }
    getLength() {
		return this.dataLength;
	}
        // @aadsm
    isBitSetAt(iOffset, iBit) {
        var iByte = this.getByteAt(iOffset);
        return (iByte & (1 << iBit)) != 0;
    }
    getSByteAt(iOffset) {
		var iByte = this.getByteAt(iOffset);
		if (iByte > 127)
			return iByte - 256;
		else
			return iByte;
	}
    getShortAt(iOffset, bBigEndian) {
		var iShort = bBigEndian ?
			(this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
			: (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset);
		if (iShort < 0) iShort += 65536;
		return iShort;
	}
    getSShortAt(iOffset, bBigEndian) {
		var iUShort = this.getShortAt(iOffset, bBigEndian);
		if (iUShort > 32767)
			return iUShort - 65536;
		else
			return iUShort;
	}
    getLongAt(iOffset, bBigEndian) {
		var iByte1 = this.getByteAt(iOffset),
			iByte2 = this.getByteAt(iOffset + 1),
			iByte3 = this.getByteAt(iOffset + 2),
			iByte4 = this.getByteAt(iOffset + 3);

		var iLong = bBigEndian ?
			(((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
			: (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
		if (iLong < 0) iLong += 4294967296;
		return iLong;
	}
    getSLongAt(iOffset, bBigEndian) {
		var iULong = this.getLongAt(iOffset, bBigEndian);
		if (iULong > 2147483647)
			return iULong - 4294967296;
		else
			return iULong;
	}
    	// @aadsm
	getInteger24At(iOffset, bBigEndian) {
        var iByte1 = this.getByteAt(iOffset),
			iByte2 = this.getByteAt(iOffset + 1),
			iByte3 = this.getByteAt(iOffset + 2);

		var iInteger = bBigEndian ?
			((((iByte1 << 8) + iByte2) << 8) + iByte3)
			: ((((iByte3 << 8) + iByte2) << 8) + iByte1);
		if (iInteger < 0) iInteger += 16777216;
		return iInteger;
    }
    getStringAt(iOffset, iLength) {
		var aStr = [];
		for (var i=iOffset,j=0;i<iOffset+iLength;i++,j++) {
			aStr[j] = String.fromCharCode(this.getByteAt(i));
		}
		return aStr.join("");
	}
    getStringWithCharsetAt(iOffset, iLength, iCharset) {
		var bytes = this.getBytesAt(iOffset, iLength);
		var sString;

		switch( iCharset.toLowerCase() ) {
		    case 'utf-16':
		    case 'utf-16le':
		    case 'utf-16be':
		        sString = StringUtils.readUTF16String(bytes, iCharset);
		        break;

		    case 'utf-8':
		        sString = StringUtils.readUTF8String(bytes);
		        break;

		    default:
		        sString = StringUtils.readNullTerminatedString(bytes);
		        break;
		}

		return sString;
	}
    getCharAt(iOffset) {
		return String.fromCharCode(this.getByteAt(iOffset));
	}
	toBase64() {
		return window.btoa(this.data);
	}
	fromBase64(strBase64) {
		this.data = window.atob(strBase64);
	}
    loadRange(range, callback) {
        callback();
    }
}


function addVbscript()
{
    var js = document.createElement('script');
    js.type = 'text/vbscript';
    js.textContent = "Function IEBinary_getByteAt(strBinary, iOffset)\r\n" +
        "	IEBinary_getByteAt = AscB(MidB(strBinary,iOffset+1,1))\r\n" +
        "End Function\r\n" +
        "Function IEBinary_getLength(strBinary)\r\n" +
        "	IEBinary_getLength = LenB(strBinary)\r\n" +
        "End Function\r\n";
    document.getElementsByTagName('head')[0].appendChild(js);
}

function BufferedBinaryAjax(strUrl, fncCallback, fncError) {
    function sendRequest(strURL, fncCallback, fncError, aRange, bAcceptRanges, iFileSize, bAsync) {
		var oHTTP = createRequest();
		if (oHTTP) {
			var iDataOffset = 0;
			if (aRange && !bAcceptRanges) {
				iDataOffset = aRange[0];
			}
			var iDataLen = 0;
			if (aRange) {
				iDataLen = aRange[1]-aRange[0]+1;
			}
			if( typeof bAsync === "undefined" ) bAsync = true;

			if (fncCallback) {
				if (typeof(oHTTP.onload) != "undefined") {
					oHTTP.onload = function() {

						if (oHTTP.status == "200" || oHTTP.status == "206") {
							oHTTP.fileSize = iFileSize || oHTTP.getResponseHeader("Content-Length");
							fncCallback(oHTTP);
						} else {
							if (fncError) {
                                fncError({error: "xhr", "xhr": oHTTP});
                            }
						}
						oHTTP = null;
					};
                    if (fncError) {
                        oHTTP.onerror = function() {
                            fncError({error: "xhr", "xhr": oHTTP});
                            oHTTP = null;
                        };
                    }
				} else {
					oHTTP.onreadystatechange = function() {
						if (oHTTP.readyState == 4) {
							if (oHTTP.status == "200" || oHTTP.status == "206") {
								oHTTP.fileSize = iFileSize || oHTTP.getResponseHeader("Content-Length");
								fncCallback(oHTTP);
							} else {
								if (fncError) {
                                    fncError({error: "xhr", "xhr": oHTTP});
                                }
							}
							oHTTP = null;
						}
					};
				}
			}
			oHTTP.open("GET", strURL, bAsync);

			if (oHTTP.overrideMimeType) oHTTP.overrideMimeType('text/plain; charset=x-user-defined');

			if (aRange && bAcceptRanges) {
				oHTTP.setRequestHeader("Range", "bytes=" + aRange[0] + "-" + aRange[1]);
			}

			oHTTP.setRequestHeader("If-Modified-Since", "Sat, 01 Jan 1970 00:00:00 GMT");

			oHTTP.send(null);
		} else {
			if (fncError) {
                fncError({error: "Unable to create XHR object"});
            }
		}
	}
    function createRequest() {
		var oHTTP = null;
		if (window.XMLHttpRequest) {
			oHTTP = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			oHTTP = new ActiveXObject("Microsoft.XMLHTTP");
		}
		return oHTTP;
	}

	function getHead(strURL, fncCallback, fncError) {
		var oHTTP = createRequest();
		if (oHTTP) {
			if (fncCallback) {
				if (typeof(oHTTP.onload) != "undefined") {
					oHTTP.onload = function() {
						if (oHTTP.status == "200" || oHTTP.status == "206") {
							fncCallback(this);
						} else {
							if (fncError) {
                                fncError({error: "xhr", "xhr": oHTTP});
                            }
						}
						oHTTP = null;
					};
                    if (fncError) {
                        oHTTP.onerror = function() {
                            fncError({error: "xhr", "xhr": oHTTP});
                            oHTTP = null;
                        };
                    }
				} else {
					oHTTP.onreadystatechange = function() {
						if (oHTTP.readyState == 4) {
							if (oHTTP.status == "200" || oHTTP.status == "206") {
								fncCallback(this);
							} else {
								if (fncError) {
                                    fncError({error: "xhr", "xhr": oHTTP});
                                }
							}
							oHTTP = null;
						}
					};
				}
			}
			oHTTP.open("HEAD", strURL, true);
			oHTTP.send(null);
		} else {
			if (fncError) {
                fncError({error: "Unable to create XHR object"});
            }
		}
	}
    
    /**
     * @class Reads a remote file without having to download it all.
     *
     * Creates a new BufferedBinaryFile that will download chunks of the file pointed by the URL given only on a per need basis.
     *
     * @param {string} strUrl The URL with the location of the file to be read.
     * @param {number} iLength The size of the file.
     * @param {number} [blockSize=2048] The size of the chunk that will be downloaded when data is read.
     * @param {number} [blockRadius=0] The number of chunks, immediately after and before the chunk needed, that will also be downloaded.
     *
     * @constructor
     * @augments BinaryFile
     */
    function BufferedBinaryFile(strUrl, iLength, blockSize, blockRadius) {
        var undefined;
        var downloadedBytesCount = 0;
        var binaryFile = new BinaryFile("", 0, iLength);
        var blocks = [];
        
        blockSize = blockSize || 1024*2;
        blockRadius = (typeof blockRadius === "undefined") ? 0 : blockRadius;
        var blockTotal = ~~((iLength-1)/blockSize) + 1;
        
        function getBlockRangeForByteRange(range) {
            var blockStart = ~~(range[0]/blockSize) - blockRadius;
            var blockEnd = ~~(range[1]/blockSize)+1 + blockRadius;
            
            if( blockStart < 0 ) blockStart = 0;
            if( blockEnd >= blockTotal ) blockEnd = blockTotal-1;
            
            return [blockStart, blockEnd];
        }
        
        // TODO: wondering if a "recently used block" could help things around
        //       here.
        function getBlockAtOffset(offset) {
            var blockRange = getBlockRangeForByteRange([offset, offset]);
            waitForBlocks(blockRange);
            return blocks[~~(offset/blockSize)];
        }
        
        /**
         * @param {?function()} callback If a function is passed then this function will be asynchronous and the callback invoked when the blocks have been loaded, otherwise it blocks script execution until the request is completed.
         */
        function waitForBlocks(blockRange, callback) {
            // Filter out already downloaded blocks or return if found out that
            // the entire block range has already been downloaded.
            while( blocks[blockRange[0]] ) {
                blockRange[0]++;
                if( blockRange[0] > blockRange[1] ) return callback ? callback() : undefined;
            }
            while( blocks[blockRange[1]] ) {
                blockRange[1]--;
                if( blockRange[0] > blockRange[1] ) return callback ? callback() : undefined;
            }
            var range = [blockRange[0]*blockSize, (blockRange[1]+1)*blockSize-1];
            //console.log("Getting: " + range[0] + " to " +  range[1]);
            sendRequest(
                strUrl,
                function(http) {
                    var size = parseInt(http.getResponseHeader("Content-Length"), 10);
                    // Range header not supported
                    if( size == iLength ) {
                        blockRange[0] = 0;
                        blockRange[1] = blockTotal-1;
                        range[0] = 0;
                        range[1] = iLength-1;
                    }
                    var block = {
                        data: http.responseBody || http.responseText,
                        offset: range[0]
                    };
                    
                    for( var i = blockRange[0]; i <= blockRange[1]; i++ ) {
                        blocks[i] = block;
                    }
                    downloadedBytesCount += range[1] - range[0] + 1;
                    if (callback) callback();
                },
                fncError,
                range,
                "bytes",
                undefined,
                !!callback
            );
        }
        
        // Mixin all BinaryFile's methods.
        // Not using prototype linking since the constructor needs to know
        // the length of the file.
        for( var key in binaryFile ) {
            if( binaryFile.hasOwnProperty(key) &&
                typeof binaryFile[key] === "function") {
                this[key] = binaryFile[key];
            }
        }
        /** 
         * @override
         */
		this.getByteAt = function(iOffset) {
		    var block = getBlockAtOffset(iOffset);
		    if( block && typeof block.data == "string" ) {
		        return block.data.charCodeAt(iOffset - block.offset) & 0xFF;
		    } else if( block && typeof block.data == "unknown" ) {
		        return IEBinary_getByteAt(block.data, iOffset - block.offset);
		    } else {
		    	return ""
		    }
		};
		
		/**
		 * Gets the number of total bytes that have been downloaded.
		 *
		 * @returns The number of total bytes that have been downloaded.
		 */
		this.getDownloadedBytesCount = function() {
		    return downloadedBytesCount;
		};
		
		/**
		 * Downloads the byte range given. Useful for preloading.
		 *
		 * @param {Array} range Two element array that denotes the first byte to be read on the first position and the last byte to be read on the last position. A range of [2, 5] will download bytes 2,3,4 and 5.
		 * @param {?function()} callback The function to invoke when the blocks have been downloaded, this makes this call asynchronous.
		 */
		this.loadRange = function(range, callback) {
		    var blockRange = getBlockRangeForByteRange(range);
		    waitForBlocks(blockRange, callback);
		};
    }
    
    function init() {
        getHead(
			strUrl, 
			function(oHTTP) {
				var iLength = parseInt(oHTTP.getResponseHeader("Content-Length"),10) || -1;
				fncCallback(new BufferedBinaryFile(strUrl, iLength));
			},
            fncError
		);
    }
    
    init();
}

class ID3v1{
    constructor(){
        this.genres = [
            "Blues","Classic Rock","Country","Dance","Disco","Funk","Grunge",
            "Hip-Hop","Jazz","Metal","New Age","Oldies","Other","Pop","R&B",
            "Rap","Reggae","Rock","Techno","Industrial","Alternative","Ska",
            "Death Metal","Pranks","Soundtrack","Euro-Techno","Ambient",
            "Trip-Hop","Vocal","Jazz+Funk","Fusion","Trance","Classical",
            "Instrumental","Acid","House","Game","Sound Clip","Gospel",
            "Noise","AlternRock","Bass","Soul","Punk","Space","Meditative",
            "Instrumental Pop","Instrumental Rock","Ethnic","Gothic",
            "Darkwave","Techno-Industrial","Electronic","Pop-Folk",
            "Eurodance","Dream","Southern Rock","Comedy","Cult","Gangsta",
            "Top 40","Christian Rap","Pop/Funk","Jungle","Native American",
            "Cabaret","New Wave","Psychadelic","Rave","Showtunes","Trailer",
            "Lo-Fi","Tribal","Acid Punk","Acid Jazz","Polka","Retro",
            "Musical","Rock & Roll","Hard Rock","Folk","Folk-Rock",
            "National Folk","Swing","Fast Fusion","Bebob","Latin","Revival",
            "Celtic","Bluegrass","Avantgarde","Gothic Rock","Progressive Rock",
            "Psychedelic Rock","Symphonic Rock","Slow Rock","Big Band",
            "Chorus","Easy Listening","Acoustic","Humour","Speech","Chanson",
            "Opera","Chamber Music","Sonata","Symphony","Booty Bass","Primus",
            "Porn Groove","Satire","Slow Jam","Club","Tango","Samba",
            "Folklore","Ballad","Power Ballad","Rhythmic Soul","Freestyle",
            "Duet","Punk Rock","Drum Solo","Acapella","Euro-House","Dance Hall"
        ];
    }
    loadData(data, callback) {
        var length = data.getLength();
        data.loadRange([length-128-1, length], callback);
    }
    readTagsFromData(data) {
    	var offset = data.getLength() - 128;
    	var header = data.getStringAt(offset, 3);
		var title = "";
		var artist = "";
		var album = "";
		var year = "";
		var comment = "";
		var track = 0;
		var genre = ""
    	if (header == "TAG") {
    		title = data.getStringAt(offset + 3, 30).replace(/\0/g, "");
    		artist = data.getStringAt(offset + 33, 30).replace(/\0/g, "");
    		album = data.getStringAt(offset + 63, 30).replace(/\0/g, "");
    		year = data.getStringAt(offset + 93, 4).replace(/\0/g, "");

    		var trackFlag = data.getByteAt(offset + 97 + 28);
    		if (trackFlag == 0) {
    			comment = data.getStringAt(offset + 97, 28).replace(/\0/g, "");
    			track = data.getByteAt(offset + 97 + 29);
    		} else {
    			comment = "";
    			track = 0;
    		}

    		var genreIdx = data.getByteAt(offset + 97 + 30);
    		if (genreIdx < 255) {
    			genre = this.genres[genreIdx];
    		} else {
    			genre = "";
    		}

    		return {
    		    "version" : '1.1',
    			"title" : title,
    			"artist" : artist,
    			"album" : album,
    			"year" : year,
    			"comment" : comment,
    			"track" : track,
    			"genre" : genre
    		}
    	} else {
    		return {};
    	}
    }
}



class ID3v2{
    constructor(){
        var self = this;
        this.readFrameData = {};
        this.readFrameData["pictureType"] = [
            "32x32 pixels 'file icon' (PNG only)",
            "Other file icon",
            "Cover (front)",
            "Cover (back)",
            "Leaflet page",
            "Media (e.g. lable side of CD)",
            "Lead artist/lead performer/soloist",
            "Artist/performer",
            "Conductor",
            "Band/Orchestra",
            "Composer",
            "Lyricist/text writer",
            "Recording Location",
            "During recording",
            "During performance",
            "Movie/video screen capture",
            "A bright coloured fish",
            "Illustration",
            "Band/artist logotype",
            "Publisher/Studio logotype"
        ];
        this.readFrameData["getTextEncoding"] = function ( bite ) {
            var charset;
            switch( bite )
            {
                case 0x00:
                    charset = 'iso-8859-1';
                    break;
                    
                case 0x01:
                    charset = 'utf-16';
                    break;
                    
                case 0x02:
                    charset = 'utf-16be';
                    break;
                    
                case 0x03:
                    charset = 'utf-8';
                    break;
            }
            
            return charset;
        };
        this.readFrameData["getTime"] = function( duration ){
            duration = duration/1000;
            var seconds = Math.floor( duration ) % 60;
            var minutes = Math.floor( duration/60 ) % 60;
            var hours = Math.floor( duration/3600 );
                
            return {
                seconds : seconds,
                minutes : minutes,
                hours   : hours
            };
        };
        this.readFrameData["formatTime"] = function( time ){
            var seconds = time.seconds < 10 ? '0'+time.seconds : time.seconds;
            var minutes = (time.hours > 0 && time.minutes < 10) ? '0'+time.minutes : time.minutes;
            
            return (time.hours>0?time.hours+':':'') + minutes + ':' + seconds;
        };
        this.readFrameData["APIC"] = function(offset, length, data, flags, v) {
            v = v || '3';
            
            var start = offset;
            var charset = self.readFrameData.getTextEncoding( data.getByteAt(offset) );
            
            var format = null;
            switch( v ) {
                case '2':
                    format = data.getStringAt(offset+1, 3);
                    offset += 4;
                    break;
                    
                case '3':
                case '4':
                    format = data.getStringWithCharsetAt(offset+1, length - (offset-start), '');
                    offset += 1 + format.bytesReadCount;
                    break;
            }
            var bite = data.getByteAt(offset, 1);
            var type = self.readFrameData.pictureType[bite];
            var desc = data.getStringWithCharsetAt(offset+1, length - (offset-start), charset);
            
            offset += 1 + desc.bytesReadCount;
            
            return {
                "format" : format.toString(),
                "type" : type,
                "description" : desc.toString(),
                "data" : data.getBytesAt(offset, (start+length) - offset)
            };
        };
        this.readFrameData["COMM"] = function(offset, length, data) {
            var start = offset;
            var charset = self.readFrameData.getTextEncoding( data.getByteAt(offset) );
            var language = data.getStringAt( offset+1, 3 );
            var shortdesc = data.getStringWithCharsetAt(offset+4, length-4, charset);
            
            offset += 4 + shortdesc.bytesReadCount;
            var text = data.getStringWithCharsetAt( offset, (start+length) - offset, charset );
            
            return {
                language : language,
                short_description : shortdesc.toString(),
                text : text.toString()
            };
        };
        this.readFrameData["COM"] = this.readFrameData["COMM"];
        this.readFrameData["PIC"] = function(offset, length, data, flags) {
            return self.APIC(offset, length, data, flags, '2');
        };
        this.readFrameData["PCNT"] = function(offset, length, data) {
            // FIXME: implement the rest of the spec
            return data.getInteger32At(offset);
        };
        this.readFrameData["CNT"] = this.readFrameData["PCNT"];
        this.readFrameData["T*"] = function(offset, length, data) {
            console.log(self.readFrameData);
            var charset = self.readFrameData.getTextEncoding( data.getByteAt(offset) );
            
            return data.getStringWithCharsetAt(offset+1, length-1, charset).toString();
        };
        this.readFrameData["TCON"] = function(offset, length, data) {
            var text = self.readFrameData['T*'].apply( self, arguments );
            return text.replace(/^\(\d+\)/, '');
        };
        this.readFrameData["TCO"] = this.readFrameData["TCON"];
        this.readFrameData["USLT"] = function(offset, length, data) {
            var start = offset;
            var charset = self.readFrameData.getTextEncoding( data.getByteAt(offset) );
            var language = data.getStringAt( offset+1, 3 );
            var descriptor = data.getStringWithCharsetAt( offset+4, length-4, charset );
            
            offset += 4 + descriptor.bytesReadCount;
            var lyrics = data.getStringWithCharsetAt( offset, (start+length) - offset, charset );
            
            return {
                language : language,
                descriptor : descriptor.toString(),
                lyrics : lyrics.toString()
            };
        };
        this.readFrameData["ULT"] = this.readFrameData["USLT"];

        this.frames = {
            // v2.2
            "BUF" : "Recommended buffer size",
            "CNT" : "Play counter",
            "COM" : "Comments",
            "CRA" : "Audio encryption",
            "CRM" : "Encrypted meta frame",
            "ETC" : "Event timing codes",
            "EQU" : "Equalization",
            "GEO" : "General encapsulated object",
            "IPL" : "Involved people list",
            "LNK" : "Linked information",
            "MCI" : "Music CD Identifier",
            "MLL" : "MPEG location lookup table",
            "PIC" : "Attached picture",
            "POP" : "Popularimeter",
            "REV" : "Reverb",
            "RVA" : "Relative volume adjustment",
            "SLT" : "Synchronized lyric/text",
            "STC" : "Synced tempo codes",
            "TAL" : "Album/Movie/Show title",
            "TBP" : "BPM (Beats Per Minute)",
            "TCM" : "Composer",
            "TCO" : "Content type",
            "TCR" : "Copyright message",
            "TDA" : "Date",
            "TDY" : "Playlist delay",
            "TEN" : "Encoded by",
            "TFT" : "File type",
            "TIM" : "Time",
            "TKE" : "Initial key",
            "TLA" : "Language(s)",
            "TLE" : "Length",
            "TMT" : "Media type",
            "TOA" : "Original artist(s)/performer(s)",
            "TOF" : "Original filename",
            "TOL" : "Original Lyricist(s)/text writer(s)",
            "TOR" : "Original release year",
            "TOT" : "Original album/Movie/Show title",
            "TP1" : "Lead artist(s)/Lead performer(s)/Soloist(s)/Performing group",
            "TP2" : "Band/Orchestra/Accompaniment",
            "TP3" : "Conductor/Performer refinement",
            "TP4" : "Interpreted, remixed, or otherwise modified by",
            "TPA" : "Part of a set",
            "TPB" : "Publisher",
            "TRC" : "ISRC (International Standard Recording Code)",
            "TRD" : "Recording dates",
            "TRK" : "Track number/Position in set",
            "TSI" : "Size",
            "TSS" : "Software/hardware and settings used for encoding",
            "TT1" : "Content group description",
            "TT2" : "Title/Songname/Content description",
            "TT3" : "Subtitle/Description refinement",
            "TXT" : "Lyricist/text writer",
            "TXX" : "User defined text information frame",
            "TYE" : "Year",
            "UFI" : "Unique file identifier",
            "ULT" : "Unsychronized lyric/text transcription",
            "WAF" : "Official audio file webpage",
            "WAR" : "Official artist/performer webpage",
            "WAS" : "Official audio source webpage",
            "WCM" : "Commercial information",
            "WCP" : "Copyright/Legal information",
            "WPB" : "Publishers official webpage",
            "WXX" : "User defined URL link frame",
            // v2.3
            "AENC" : "Audio encryption",
            "APIC" : "Attached picture",
            "COMM" : "Comments",
            "COMR" : "Commercial frame",
            "ENCR" : "Encryption method registration",
            "EQUA" : "Equalization",
            "ETCO" : "Event timing codes",
            "GEOB" : "General encapsulated object",
            "GRID" : "Group identification registration",
            "IPLS" : "Involved people list",
            "LINK" : "Linked information",
            "MCDI" : "Music CD identifier",
            "MLLT" : "MPEG location lookup table",
            "OWNE" : "Ownership frame",
            "PRIV" : "Private frame",
            "PCNT" : "Play counter",
            "POPM" : "Popularimeter",
            "POSS" : "Position synchronisation frame",
            "RBUF" : "Recommended buffer size",
            "RVAD" : "Relative volume adjustment",
            "RVRB" : "Reverb",
            "SYLT" : "Synchronized lyric/text",
            "SYTC" : "Synchronized tempo codes",
            "TALB" : "Album/Movie/Show title",
            "TBPM" : "BPM (beats per minute)",
            "TCOM" : "Composer",
            "TCON" : "Content type",
            "TCOP" : "Copyright message",
            "TDAT" : "Date",
            "TDLY" : "Playlist delay",
            "TENC" : "Encoded by",
            "TEXT" : "Lyricist/Text writer",
            "TFLT" : "File type",
            "TIME" : "Time",
            "TIT1" : "Content group description",
            "TIT2" : "Title/songname/content description",
            "TIT3" : "Subtitle/Description refinement",
            "TKEY" : "Initial key",
            "TLAN" : "Language(s)",
            "TLEN" : "Length",
            "TMED" : "Media type",
            "TOAL" : "Original album/movie/show title",
            "TOFN" : "Original filename",
            "TOLY" : "Original lyricist(s)/text writer(s)",
            "TOPE" : "Original artist(s)/performer(s)",
            "TORY" : "Original release year",
            "TOWN" : "File owner/licensee",
            "TPE1" : "Lead performer(s)/Soloist(s)",
            "TPE2" : "Band/orchestra/accompaniment",
            "TPE3" : "Conductor/performer refinement",
            "TPE4" : "Interpreted, remixed, or otherwise modified by",
            "TPOS" : "Part of a set",
            "TPUB" : "Publisher",
            "TRCK" : "Track number/Position in set",
            "TRDA" : "Recording dates",
            "TRSN" : "Internet radio station name",
            "TRSO" : "Internet radio station owner",
            "TSIZ" : "Size",
            "TSRC" : "ISRC (international standard recording code)",
            "TSSE" : "Software/Hardware and settings used for encoding",
            "TYER" : "Year",
            "TXXX" : "User defined text information frame",
            "UFID" : "Unique file identifier",
            "USER" : "Terms of use",
            "USLT" : "Unsychronized lyric/text transcription",
            "WCOM" : "Commercial information",
            "WCOP" : "Copyright/Legal information",
            "WOAF" : "Official audio file webpage",
            "WOAR" : "Official artist/performer webpage",
            "WOAS" : "Official audio source webpage",
            "WORS" : "Official internet radio station homepage",
            "WPAY" : "Payment",
            "WPUB" : "Publishers official webpage",
            "WXXX" : "User defined URL link frame"
        };
        this._shortcuts = {
            "title"     : ["TIT2", "TT2"],
            "artist"    : ["TPE1", "TP1"],
            "album"     : ["TALB", "TAL"],
            "year"      : ["TYER", "TYE"],
            "comment"   : ["COMM", "COM"],
            "track"     : ["TRCK", "TRK"],
            "genre"     : ["TCON", "TCO"],
            "picture"   : ["APIC", "PIC"],
            "lyrics"    : ["USLT", "ULT"]
        };
        this._defaultShortcuts = ["title", "artist", "album", "track"];
    }
    getTagsFromShortcuts(shortcuts) {
        var tags = [];
        for( var i = 0, shortcut; shortcut = shortcuts[i]; i++ ) {
            tags = tags.concat(this._shortcuts[shortcut]||[shortcut]);
        }
        return tags;
    }
    // The ID3v2 tag/frame size is encoded with four bytes where the most significant bit (bit 7) is set to zero in every byte, making a total of 28 bits. The zeroed bits are ignored, so a 257 bytes long tag is represented as $00 00 02 01.
    readSynchsafeInteger32At(offset, data) {
        var size1 = data.getByteAt(offset);
        var size2 = data.getByteAt(offset+1);
        var size3 = data.getByteAt(offset+2);
        var size4 = data.getByteAt(offset+3);
        // 0x7f = 0b01111111
        var size = size4 & 0x7f
                 | ((size3 & 0x7f) << 7)
                 | ((size2 & 0x7f) << 14)
                 | ((size1 & 0x7f) << 21);
    
        return size;
    }
    readFrameFlags(data, offset){
        var flags =
        {
            message:
            {
                tag_alter_preservation  : data.isBitSetAt( offset, 6),
                file_alter_preservation : data.isBitSetAt( offset, 5),
                read_only               : data.isBitSetAt( offset, 4)
            },
            format: 
            {
                grouping_identity       : data.isBitSetAt( offset+1, 7),
                compression             : data.isBitSetAt( offset+1, 3),
                encription              : data.isBitSetAt( offset+1, 2),
                unsynchronisation       : data.isBitSetAt( offset+1, 1),
                data_length_indicator   : data.isBitSetAt( offset+1, 0)
            }
        };
        
        return flags;
    }
    /** All the frames consists of a frame header followed by one or more fields containing the actual information.
     * The frame ID made out of the characters capital A-Z and 0-9. Identifiers beginning with "X", "Y" and "Z" are for experimental use and free for everyone to use, without the need to set the experimental bit in the tag header. Have in mind that someone else might have used the same identifier as you. All other identifiers are either used or reserved for future use.
     * The frame ID is followed by a size descriptor, making a total header size of ten bytes in every frame. The size is calculated as frame size excluding frame header (frame size - 10).
     */
    readFrames (offset, end, data, id3header, tags){
        var frames = {};
        var frameDataSize;
        var major = id3header["major"];
        
        tags = this.getTagsFromShortcuts(tags || this._defaultShortcuts);
        
        while( offset < end ) {
            var readFrameFunc = null;
            var frameData = data;
            var frameDataOffset = offset;
            var flags = null;
            var frameID = null;
            var frameSize = null;
            var frameHeaderSize = 0;
            
            switch( major ) {
                case 2:
                frameID = frameData.getStringAt(frameDataOffset, 3);
                frameSize = frameData.getInteger24At(frameDataOffset+3, true);
                frameHeaderSize = 6;
                break;

                case 3:
                frameID = frameData.getStringAt(frameDataOffset, 4);
                frameSize = frameData.getLongAt(frameDataOffset+4, true);
                frameHeaderSize = 10;
                break;
                
                case 4:
                frameID = frameData.getStringAt(frameDataOffset, 4);
                frameSize = this.readSynchsafeInteger32At(frameDataOffset+4, frameData);
                frameHeaderSize = 10;
                break;
            }
            // if last frame GTFO
            if( frameID == "" ) { break; }
            
            // advance data offset to the next frame data
            offset += frameHeaderSize + frameSize;
            // skip unwanted tags
            if( tags.indexOf( frameID ) < 0 ) { continue; }
            
            // read frame message and format flags
            if( major > 2 )
            {
                flags = this.readFrameFlags(frameData, frameDataOffset+8);
            }
            
            frameDataOffset += frameHeaderSize;
            
            // the first 4 bytes are the real data size 
            // (after unsynchronisation && encryption)
            if( flags && flags.format.data_length_indicator )
            {
                frameDataSize = this.readSynchsafeInteger32At(frameDataOffset, frameData);
                frameDataOffset += 4;
                frameSize -= 4;
            }
            
            // TODO: support unsynchronisation
            if( flags && flags.format.unsynchronisation )
            {
                //frameData = removeUnsynchronisation(frameData, frameSize);
                continue;
            }
                            
            // find frame parsing function
            if( frameID in this.readFrameData ) {
                readFrameFunc = this.readFrameData[frameID];
            } else if( frameID[0] == "T" ) {
                readFrameFunc = this.readFrameData["T*"];
            }
            
            var parsedData = readFrameFunc ? readFrameFunc(frameDataOffset, frameSize, frameData, flags) : undefined;
            var desc = frameID in this.frames ? this.frames[frameID] : 'Unknown';
        
            var frame = {
                id          : frameID,
                size        : frameSize,
                description : desc,
                data        : parsedData
            };
        
            if( frameID in frames ) {
                if( frames[frameID].id ) {
                    frames[frameID] = [frames[frameID]];
                }
                frames[frameID].push(frame);
            } else {
                frames[frameID] = frame;
            }
        }
    
        return frames;
    }
      
    getFrameData ( frames, ids ) {
        if( typeof ids == 'string' ) { ids = [ids]; }
    
        for( var i = 0, id; id = ids[i]; i++ ) {
            if( id in frames ) { return frames[id].data; }
        }
    }
    loadData(data, callback) {
        data.loadRange([0, this.readSynchsafeInteger32At(6, data)], callback);
    }
    // http://www.id3.org/id3v2.3.0
    readTagsFromData(data, tags) {
        var offset = 0;
        var major = data.getByteAt(offset+3);
        if( major > 4 ) { return {version: '>2.4'}; }
        var revision = data.getByteAt(offset+4);
        var unsynch = data.isBitSetAt(offset+5, 7);
        var xheader = data.isBitSetAt(offset+5, 6);
        var xindicator = data.isBitSetAt(offset+5, 5);
        var size = this.readSynchsafeInteger32At(offset+6, data);
        offset += 10;
        
        if( xheader ) {
            var xheadersize = data.getLongAt(offset, true);
            // The 'Extended header size', currently 6 or 10 bytes, excludes itself.
            offset += xheadersize + 4;
        }

        var id3 = {
    	    "version" : '2.' + major + '.' + revision,
    	    "major" : major,
    	    "revision" : revision,
    	    "flags" : {
    	        "unsynchronisation" : unsynch,
    	        "extended_header" : xheader,
    	        "experimental_indicator" : xindicator
    	    },
    	    "size" : size
    	};
        var frames = unsynch ? {} : this.readFrames(offset, size-10, data, id3, tags);
    	// create shortcuts for most common data
        for( var name in this._shortcuts )
        {
            if(this._shortcuts.hasOwnProperty(name)) 
            {
                let data = this.getFrameData( frames, this._shortcuts[name] );
                if( data ) 
                    id3[name] = data;
            }
        } 
            
    	
    	for( var frame in frames ) 
        {
    	    if( frames.hasOwnProperty(frame) ) 
            {
    	        id3[frame] = frames[frame];
    	    }
    	}
    	
    	return id3;
    }
}

class ID4{
    constructor(){
        this.types = {
            '0'     : 'uint8',
            '1'     : 'text',
            '13'    : 'jpeg',
            '14'    : 'png',
            '21'    : 'uint8'
        };
        this.atom = {
            '©alb': ['album'],
            '©art': ['artist'],
            '©ART': ['artist'],
            'aART': ['artist'],
            '©day': ['year'],
            '©nam': ['title'],
            '©gen': ['genre'],
            'trkn': ['track'],
            '©wrt': ['composer'],
            '©too': ['encoder'],
            'cprt': ['copyright'],
            'covr': ['picture'],
            '©grp': ['grouping'],
            'keyw': ['keyword'],
            '©lyr': ['lyrics'],
            '©cmt': ['comment'],
            'tmpo': ['tempo'],
            'cpil': ['compilation'],
            'disk': ['disc']
        };
    }
    loadData(data, callback) {
        // load the header of the first block
        var self = this;
        data.loadRange([0, 7], function () {
            self.loadAtom(data, 0, data.getLength(), callback);
        });
    }
    /**
     * Make sure that the [offset, offset+7] bytes (the block header) are
     * already loaded before calling this function.
     */
    loadAtom (data, offset, length, callback) {
        // 8 is the size of the atomSize and atomName fields.
        // When reading the current block we always read 8 more bytes in order
        // to also read the header of the next block.
        var atomSize = data.getLongAt(offset, true);
        if (atomSize == 0) return callback();
        var atomName = data.getStringAt(offset + 4, 4);
        var self = this;
        // Container atoms
        if (['moov', 'udta', 'meta', 'ilst'].indexOf(atomName) > -1)
        {
            if (atomName == 'meta') offset += 4; // next_item_id (uint32)
            data.loadRange([offset+8, offset+8 + 8], function() {
                self.loadAtom(data, offset + 8, atomSize - 8, callback);
            });
        } else {
            // Value atoms
            var readAtom = atomName in this.atom;
            data.loadRange([offset+(readAtom?0:atomSize), offset+atomSize + 8], function() {
                self.loadAtom(data, offset+atomSize, length, callback);
            });
        }       
    }
    readTagsFromData(data) {
        var tag = {};
        this.readAtom(tag, data, 0, data.getLength());
        return tag;
    }
    readAtom (tag, data, offset, length, indent){
        indent = indent === undefined ? "" : indent + "  ";
        var seek = offset;
        while (seek < offset + length)
        {
            var atomSize = data.getLongAt(seek, true);
            if (atomSize == 0) return;
            var atomName = data.getStringAt(seek + 4, 4);
            // Container atoms
            if (['moov', 'udta', 'meta', 'ilst'].indexOf(atomName) > -1)
            {
                if (atomName == 'meta') seek += 4; // next_item_id (uint32)
                this.readAtom(tag, data, seek + 8, atomSize - 8, indent);
                return;
            }
            // Value atoms
            if (this.atom[atomName])
            {
                var klass = data.getInteger24At(seek + 16 + 1, true);
                var atom = this.atom[atomName];
                var type = this.types[klass];
                if (atomName == 'trkn')
                {
                    tag[atom[0]] = data.getByteAt(seek + 16 + 11);
                    tag['count'] = data.getByteAt(seek + 16 + 13);
                }
                else
                {
                    // 16: name + size + "data" + size (4 bytes each)
                    // 4: atom version (1 byte) + atom flags (3 bytes)
                    // 4: NULL (usually locale indicator)
                    var dataStart = seek + 16 + 4 + 4;
                    var dataEnd = atomSize - 16 - 4 - 4;
                    var atomData;
                    switch( type ) {
                        case 'text':
                            atomData = data.getStringWithCharsetAt(dataStart, dataEnd, "UTF-8");
                            break;
                            
                        case 'uint8':
                            atomData = data.getShortAt(dataStart);
                            break;
                            
                        case 'jpeg':
                        case 'png':
                            atomData = {
                                format  : "image/" + type,
                                data    : data.getBytesAt(dataStart, dataEnd)
                            };
                            break;
                    }

                    if (atom[0] === "comment") {
                        tag[atom[0]] = {
                            "text": atomData
                        };
                    } else {
                        tag[atom[0]] = atomData;
                    }
                }
            }
            seek += atomSize;
        }
    }
}

class ID3{
	constructor()
	{
        addVbscript();
		this._files = {};
		// location of the format identifier
		this._formatIDRange = [0, 7];
		this.ID4 = new ID4();
		this.ID3v2 = new ID3v2();
		this.ID3v1 = new ID3v1();
	}
    FileAPIReader(file, opt_reader) {
        return function(url, fncCallback, fncError) {
            var reader = opt_reader || new FileReader();
    
            reader.onload = function(event) {
                var result = event.target.result;
                fncCallback(new BinaryFile(result));
            };
            reader.readAsBinaryString(file);
        }
    }
    /**
        * Finds out the tag format of this data and returns the appropriate
        * reader.
        */
    getTagReader(data) {
        // FIXME: improve this detection according to the spec
        return data.getStringAt(4, 7) == "ftypM4A" ? this.ID4 :
                (data.getStringAt(0, 3) == "ID3" ? this.ID3v2 : this.ID3v1);
    }
    
    readTags(reader, data, url, tags) {
        var tagsFound = reader.readTagsFromData(data, tags);
        //console.log("Downloaded data: " + data.getDownloadedBytesCount() + "bytes");
        tags = this._files[url] || {};
        for( var tag in tagsFound ) if( tagsFound.hasOwnProperty(tag) ) {
            tags[tag] = tagsFound[tag];
        }
        this._files[url] = tags;
    }
    
    clearTags(url) {
        delete this._files[url];
    }
    
    clearAll() {
        this._files = {};
    }
    /**
        * @param {string} url The location of the sound file to read.
        * @param {function()} cb The callback function to be invoked when all tags have been read.
        * @param {{tags: Array.<string>, dataReader: function(string, function(BinaryReader))}} options The set of options that can specify the tags to be read and the dataReader to use in order to read the file located at url.
        */
    loadTags(url, cb, options) {
        options = options || {};
        var dataReader = options["dataReader"] || BufferedBinaryAjax;

        dataReader(url, (data)=> {
            // preload the format identifier
            data.loadRange(this._formatIDRange, ()=> {
                var reader = this.getTagReader(data);
                console.log(reader);
                reader.loadData(data, ()=> {
                    this.readTags(reader, data, url, options["tags"]);
                    if( cb ) cb();
                });
            });
        }, options["onError"]);
    }
    getAllTags(url) {
        if (!this._files[url]) return null;
        
        var tags = {};
        for (var a in this._files[url]) {
            if (this._files[url].hasOwnProperty(a))
                tags[a] = this._files[url][a];
        }
        return tags;
    }
    
    getTag(url, tag) {
        if (!this._files[url]) return null;
    
        return this._files[url][tag];
    }
}
export default new ID3();